import {Workflow, WorkflowStartOptions} from '@temporalio/client';
import {Express, Request, Response} from 'express';
import {Logger} from 'winston';
import {camelize} from '../../utils/camelize';
import {findLastError} from '../../utils/find-jobar-error-cause';
import {formatId} from '../../utils/format-id';
import {JobarError} from '../error';
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
		return;
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
		const {setWorkflowId} = this.options ?? {};
		const workflowId = setWorkflowId ? setWorkflowId(req) : 'workflow-' + this.name;
		return formatId(workflowId);
	}

	/* istanbul ignore next */
	async run(config: TaskConfig) {
		const {app, logger, defaultStatusCodeError} = config;
		if (!this.isExposed) {
			throw new Error('❌ Set isExposed to true in the options of this task to enable route creation');
		}
		if (!this.method) {
			throw new Error('❌ Set method to "get" | "post" | "put" | "patch" | "delete" in the options of this task to enable route creation');
		}
		logger.info(`${this.info} listening`);
		app[this.method](this.url, async (req: Request, res: Response) => {
			logger.debug(`⌛ ${this.info} requested`);
			if (!this.taskQueue) {
				throw new Error('❌ This task is not assigned in a taskQueue.');
			}
			const {workflowStartOptions} = this.options ?? {};
			const workflowId = this.getWorkflowId(req);
			try {
				const client = await this.taskQueue.createNewClient(config);
				const handle = await client.workflow.start(this.workflowFunction, {
					...workflowStartOptions,
					args: this.needWorkflowFullRequest ? [req, res] : [req.body, req.headers],
					taskQueue: this.taskQueue.name,
					workflowId,
				});
				logger.debug(`⌛ WORKFLOW ${workflowId} requested`);
				const response = await handle.result();
				logger.debug(`✅ WORKFLOW ${workflowId} ended`);
				res.json(response);
			} catch (workflowError: unknown) {
				const error = findLastError(workflowError);
				const defaultError = new JobarError('No Message Available');
				const parsedMessage = JSON.parse(error.message);
				if (!parsedMessage.isJobarError) {
					logger.warn('⚠️ Prefer to use JobarError in your activities');
				}
				const jobarError = error as JobarError;
				logger.error(`❌ WORKFLOW ${workflowId} failed : ${jobarError?.message}`);
				res.status(jobarError?.options?.statusCode ?? defaultStatusCodeError).json({
					error: jobarError?.options?.error ?? defaultError.options.error,
					message: jobarError?.message ?? defaultError.message,
					details: jobarError?.options?.details ?? defaultError.options.details,
				});
			}
		});
	}
}
