import {Workflow, WorkflowStartOptions} from '@temporalio/client';
import {WorkflowError} from '@temporalio/workflow';
import {Express, Request, Response} from 'express';
import {Logger} from 'winston';
import {RequestErrorFunction} from '../../utils';
import {camelize} from '../../utils/camelize';
import {formatId} from '../../utils/format-id';
import {TaskQueue} from '../taskQueue';

export interface TaskOptions {
	workflowStartOptions?: WorkflowStartOptions;
	setWorkflowId?: (req: Request) => string;
	isExposed?: boolean;
	method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
	endpoint?: string;
	prefixUrl?: string;
	needWorkflowFullRequest?: boolean;
}

export interface TaskConfig {
	app: Express;
	logger: Logger;
	namespace: string;
	temporalAddress: string;
	defaultStatusCodeError: number;
	onRequestError: RequestErrorFunction;
}

export class Task {
	private taskQueue: TaskQueue | undefined;

	constructor(private readonly workflowFunction: Workflow, private readonly options: TaskOptions = {}) {}

	get name() {
		return camelize(this.workflowFunction.name);
	}

	get url() {
		const {prefixUrl, endpoint} = this.options;
		return `/${prefixUrl ?? 'tasks'}/${endpoint ?? this.name}`;
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
	async run(config: TaskConfig) {
		const {app, logger, onRequestError} = config;
		if (!this.isExposed) {
			throw new Error('❌ Set isExposed to true in the options of this task to enable route creation');
		}
		if (!this.method) {
			throw new Error('❌ Set method to "get" | "post" | "put" | "patch" | "delete" in the options of this task to enable route creation');
		}
		logger.info(`${this.info} listening`);
		app[this.method](this.url, async (request: Request, response: Response) => {
			logger.debug(`⌛ ${this.info} requested`);
			if (!this.taskQueue) {
				throw new Error('❌ This task is not assigned in a taskQueue.');
			}
			const {workflowStartOptions} = this.options ?? {};
			const workflowId = this.getWorkflowId(request);
			try {
				const client = await this.taskQueue.createNewClient(config);
				const handle = await client.workflow.start(this.workflowFunction, {
					...workflowStartOptions,
					args: this.needWorkflowFullRequest ? [request, response] : [request.body, request.headers],
					taskQueue: this.taskQueue.name,
					workflowId,
				});
				logger.debug(`⌛ WORKFLOW ${workflowId} requested`);
				const result = await handle.result();
				logger.debug(`✅ WORKFLOW ${workflowId} ended`);
				response.json(result);
			} catch (workflowError: unknown) {
				logger.error(`❌ WORKFLOW ${workflowId} failed`);
				onRequestError(workflowId, {workflowError: workflowError as WorkflowError, request, response, taskConfig: config});
			}
		});
	}
}
