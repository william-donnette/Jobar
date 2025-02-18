import {NativeConnection, WorkerOptions} from '@temporalio/worker';
import {Express} from 'express';
import {Logger} from 'winston';
import {JobarError, JobarErrorOptions} from './models/error';
import {TaskQueue} from './models/taskQueue';
import {RequestErrorFunction, onRequestErrorDefault} from './utils';
import {getDefaultLogger} from './utils/logger';

interface JobarOptions {
	app: Express;
	workflowsPath: string;
	temporalAddress: string;
	logger?: Logger;
	logLevel?: string;
	namespace?: string;
	defaultStatusCodeError?: number;
	onRequestError?: RequestErrorFunction;
}

interface JobarConfig {
	activities: WorkerOptions['activities'];
}

export class Jobar {
	private readonly tasksQueues: Array<TaskQueue> = [];
	app: Express;
	activities: WorkerOptions['activities'];
	workflowsPath: string;
	temporalAddress: string;
	logger: Logger;
	logLevel: string;
	namespace: string;
	defaultStatusCodeError: number;
	onRequestError: RequestErrorFunction;

	constructor({
		app,
		workflowsPath,
		temporalAddress,
		logger,
		logLevel = 'debug',
		namespace = 'default',
		defaultStatusCodeError = 500,
		onRequestError,
	}: JobarOptions) {
		this.app = app;
		this.temporalAddress = temporalAddress;
		this.workflowsPath = workflowsPath;
		this.logLevel = logLevel;
		this.namespace = namespace;
		this.logger = logger ?? getDefaultLogger(this.logLevel);
		this.defaultStatusCodeError = defaultStatusCodeError;
		this.onRequestError = onRequestError ?? onRequestErrorDefault;
	}

	addTaskQueue(taskQueue: TaskQueue) {
		if (this.tasksQueues.map((taskQueue) => taskQueue.name).includes(taskQueue.name)) {
			throw new Error('❌ A TaskQueue with same name already exist.');
		}
		this.tasksQueues.push(taskQueue);
		return this;
	}

	static error(message: string, options: JobarErrorOptions = {}) {
		return new JobarError(message, options);
	}

	/* istanbul ignore next */
	async run({activities}: JobarConfig) {
		this.logger.info(`🚀 Try to connect to temporal on ${this.temporalAddress}..`);
		const connection = await NativeConnection.connect({
			address: this.temporalAddress,
		});
		this.logger.info(`✅ Connected to temporal`);
		for (const taskQueue of this.tasksQueues) {
			taskQueue.run({
				app: this.app,
				connection,
				logger: this.logger,
				namespace: this.namespace,
				temporalAddress: this.temporalAddress,
				workerOptions: {
					taskQueue: taskQueue.name,
					workflowsPath: this.workflowsPath,
					activities,
				},
				defaultStatusCodeError: this.defaultStatusCodeError,
				onRequestError: this.onRequestError,
			});
		}
	}
}
