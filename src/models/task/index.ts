import {TaskQueue} from '@models/taskQueue';
import {Jobar} from '@src/jobar';
import {findInitialError} from '@src/utils';
import {ScheduleClient, ScheduleOptions, Workflow, WorkflowStartOptions} from '@temporalio/client';
import {WorkflowError} from '@temporalio/workflow';
import {camelize} from '@utils/camelize';
import {formatId} from '@utils/format-id';
import {Request, Response} from 'express';

export interface TaskOptions {
	workflowStartOptions?: WorkflowStartOptions;
	setWorkflowId?: (req: Request) => string;
	isExposed?: boolean;
	method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
	endpoint?: string;
	prefixUrl?: string;
	needWorkflowFullRequest?: boolean;
	scheduleOptions?: ScheduleOptions;
}

export class Task {
	private taskQueue: TaskQueue | undefined;

	constructor(private readonly workflowFunction: Workflow, private readonly options: TaskOptions = {}) {}

	get name() {
		return camelize(this.workflowFunction.name);
	}

	get url() {
		const {endpoint} = this.options;
		const url = endpoint ?? this.name;
		return `/${url.split('/').filter(Boolean).join('/')}`;
	}

	get method() {
		if (this.isExposed && this.options?.method) {
			return this.options.method;
		}
		return undefined;
	}

	get isExposed() {
		return this.options?.isExposed ?? false;
	}

	get isValid() {
		if (!this.taskQueue) {
			return false;
		}
		return this.taskQueue.hasTask(this);
	}

	get isScheduled() {
		return !!this.options.scheduleOptions;
	}

	get info() {
		if (this.isExposed && this.method) {
			return `Task ${this.name} is exposed on ${this.method.toUpperCase()} ${this.url}`;
		}
		return `Task ${this.name}`;
	}

	get needWorkflowFullRequest() {
		return this.options.needWorkflowFullRequest ?? false;
	}

	setTaskQueue(taskQueue: TaskQueue) {
		if (taskQueue.hasTask(this)) {
			this.taskQueue = taskQueue;
		} else {
			throw new Error(`❌ The taskQueue ${taskQueue.name} don't have the task ${this.name}`);
		}
	}

	getWorkflowId(req: Request) {
		const {setWorkflowId} = this.options;
		const workflowId = setWorkflowId ? setWorkflowId(req) : 'workflow-' + this.name;
		return formatId(workflowId);
	}

	/* istanbul ignore next */
	async createScheduler(jobarInstance: Jobar) {
		if (!this.taskQueue) {
			throw new Error('❌ This task is not assigned in a taskQueue.');
		}
		const {scheduleOptions} = this.options;
		if (!scheduleOptions) {
			return null;
		}
		const connection = await this.taskQueue.createNewConnection(jobarInstance);
		const scheduleClient = new ScheduleClient({connection});
		return await scheduleClient.create({
			...scheduleOptions,
			action: {
				...scheduleOptions?.action,
				workflowType: this.workflowFunction,
				taskQueue: this.taskQueue.name,
			},
		});
	}

	/* istanbul ignore next */
	async run(jobarInstance: Jobar) {
		const {app, logger, onRequestError} = jobarInstance;
		if (!this.isExposed) {
			throw new Error('❌ Set isExposed to true in the options of this task to enable route creation');
		}
		if (!this.method) {
			throw new Error('❌ Set method to "get" | "post" | "put" | "patch" | "delete" in the options of this task to enable route creation');
		}
		app[this.method](this.url, async (request: Request, response: Response) => {
			logger.debug(`⌛ ${this.info} requested`);
			if (!this.taskQueue) {
				throw new Error('❌ This task is not assigned in a taskQueue.');
			}
			const {workflowStartOptions} = this.options ?? {};
			const workflowId = this.getWorkflowId(request);
			try {
				const client = await this.taskQueue.createNewClient(jobarInstance);
				const handle = await client.workflow.start(this.workflowFunction, {
					...workflowStartOptions,
					args: this.needWorkflowFullRequest ? [request, response] : [request.body, request.headers],
					taskQueue: this.taskQueue.name,
					workflowId,
				});
				logger.debug(`⌛ WORKFLOW ${workflowId} requested`);
				const result = await handle.result();
				logger.debug(`✅ WORKFLOW ${workflowId} ended`);
				if (!response.headersSent) {
					response.status(200).json(result ?? null);
				}
				return result;
			} catch (workflowError: unknown) {
				logger.error(`❌ WORKFLOW ${workflowId} failed`);
				return await onRequestError({
					workflowId,
					workflowError: workflowError as WorkflowError,
					initialError: findInitialError(workflowError),
					request,
					response,
					jobarInstance,
				});
			}
		});
		logger.info(`👂 ${this.info} listening`);
		if (this.isScheduled) {
			await this.createScheduler(jobarInstance);
			logger.info(`📅 ${this.info} scheduled`);
		}
	}
}
