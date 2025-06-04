import {TaskQueue} from '@models/taskQueue';
import {Jobar} from '@src/jobar';
import {findInitialError} from '@src/utils';
import {ScheduleClient, ScheduleOptions, ScheduleOptionsAction, Workflow, WorkflowStartOptions} from '@temporalio/client';
import {WorkflowError} from '@temporalio/workflow';
import {camelize} from '@utils/camelize';
import {formatId} from '@utils/format-id';
import {Request, RequestHandler, Response} from 'express';
import {v4 as uuid} from 'uuid';

type CommonTaskOptions = {
	workflowStartOptions?: Omit<WorkflowStartOptions, 'args' | 'taskQueue' | 'workflowId'>;
	scheduleOptions?: Omit<ScheduleOptions, 'action'> & {
		action: Omit<ScheduleOptionsAction, 'workflowType' | 'taskQueue'>;
	};
	useUniqueWorkflowId?: boolean;
};

type ExposedTaskOptions = CommonTaskOptions & {
	isExposed: true;
	setWorkflowId?: (req: Request) => string;
	method: 'get' | 'post' | 'put' | 'patch' | 'delete';
	endpoint: string;
	prefixUrl?: string;
	needWorkflowFullRequest?: boolean;
	requestHandlers?: Array<RequestHandler>;
};

type InternalTaskOptions = CommonTaskOptions & {
	isExposed?: false;
	setWorkflowId?: never;
	method?: never;
	endpoint?: never;
	prefixUrl?: never;
	needWorkflowFullRequest?: never;
	requestHandlers?: never;
};

export type TaskOptions = ExposedTaskOptions | InternalTaskOptions;

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

	/* istanbul ignore next */
	getWorkflowId(req: Request, jobarInstance: Jobar) {
		const {setWorkflowId, useUniqueWorkflowId = jobarInstance.useUniqueWorkflowId} = this.options;
		let workflowId = 'workflow-' + this.name;
		if (setWorkflowId) {
			workflowId = setWorkflowId(req);
		}
		if (useUniqueWorkflowId) {
			workflowId += '-' + uuid();
		}
		return formatId(workflowId);
	}

	/* istanbul ignore next */
	async createScheduler(jobarInstance: Jobar) {
		if (!this.taskQueue) {
			throw new Error('❌ This task is not assigned in a taskQueue.');
		}
		const {logger} = jobarInstance;
		const {scheduleOptions} = this.options;
		if (!scheduleOptions) {
			return null;
		}
		const connection = await this.taskQueue.createNewConnection(jobarInstance);
		const scheduleClient = new ScheduleClient({connection, namespace: jobarInstance.namespace});
		try {
			await scheduleClient.getHandle(scheduleOptions.scheduleId).delete();
		} catch {}
		const handler = await scheduleClient.create({
			...scheduleOptions,
			action: {
				...scheduleOptions?.action,
				workflowType: this.workflowFunction,
				taskQueue: this.taskQueue.name,
			},
		});
		logger.info(`📅 ${this.info} scheduled`);
		return handler;
	}

	/* istanbul ignore next */
	async createRoute(jobarInstance: Jobar) {
		if (!this.taskQueue) {
			throw new Error('❌ This task is not assigned in a taskQueue.');
		}
		if (!this.method) {
			throw new Error('❌ Set method to "get" | "post" | "put" | "patch" | "delete" in the options of this task to enable route creation');
		}
		const {app, logger, onRequestError} = jobarInstance;
		const {requestHandlers = []} = this.options;
		app[this.method](this.url, ...requestHandlers, async (request: Request, response: Response) => {
			logger.debug(`⌛ ${this.info} requested`);
			if (!this.taskQueue) {
				throw new Error('❌ This task is not assigned in a taskQueue.');
			}
			const {workflowStartOptions} = this.options ?? {};
			const workflowId = this.getWorkflowId(request, jobarInstance);
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
	}

	/* istanbul ignore next */
	async run(jobarInstance: Jobar) {
		if (this.isExposed) {
			await this.createRoute(jobarInstance);
		}
		if (this.isScheduled) {
			await this.createScheduler(jobarInstance);
		}
	}
}
