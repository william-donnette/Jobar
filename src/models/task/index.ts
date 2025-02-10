import {Workflow, WorkflowFailedError, WorkflowStartOptions} from '@temporalio/client';
import {Express, Request, Response} from 'express';
import {Logger} from 'winston';
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
}

export interface TaskConfig {
	app: Express;
	logger: Logger;
	namespace: string;
	temporalAddress: string;
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
		throw new Error('Set method to "get" | "post" | "put" | "patch" | "delete" in the options of this task to enable route creation');
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
		return `${this.method.toUpperCase()} ${this.url}`;
	}

	setTaskQueue(taskQueue: TaskQueue) {
		if (taskQueue.hasTask(this)) {
			this.taskQueue = taskQueue;
		} else {
			throw new Error(`❌ The taskQueue ${taskQueue.name} don't have the task ${this.name}`);
		}
	}

	getWorkflowId(req: Request) {
		const {setWorkflowId} = this.options ?? {};
		const workflowId = setWorkflowId ? setWorkflowId(req) : 'workflow-' + this.name;
		return formatId(workflowId);
	}

	/* istanbul ignore next */
	async run(config: TaskConfig) {
		const {app, logger} = config;
		if (!this.isExposed) {
			throw new Error('❌ Set isExposed to true in the options of this task to enable route creation');
		}
		logger.debug(`🚀 ${this.info} listening`);
		app[this.method](this.url, async (req: Request, res: Response) => {
			logger.debug(`${this.info} requested`);
			if (!this.taskQueue) {
				throw new Error('❌ This task is not assigned in a taskQueue.');
			}
			const {workflowStartOptions} = this.options ?? {};
			const workflowId = this.getWorkflowId(req);
			try {
				const client = await this.taskQueue.createNewClient(config);
				const handle = await client.workflow.start(this.workflowFunction, {
					...workflowStartOptions,
					args: [req.body, req.headers],
					taskQueue: this.taskQueue.name,
					workflowId,
				});
				logger.info(`⌛ WORKFLOW ${workflowId} running`);
				const response = await handle.result();
				logger.info(`✅ WORKFLOW ${workflowId} ended`);
				res.json(response);
			} catch (workflowError: unknown) {
				const typedError = workflowError as WorkflowFailedError;
				const error = typedError.cause;
				logger.error(`❌ WORKFLOW ${workflowId} failed : ${error?.message ?? typedError?.message}`);
				res.status(200).json({
					error: error?.cause?.message ?? new Error('internal_server_error'),
					error_description: error?.message ?? typedError.message,
				});
			}
		});
	}
}
