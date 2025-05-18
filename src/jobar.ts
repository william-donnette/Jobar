import {TaskQueue} from '@models/taskQueue';
import {NativeConnection, WorkerOptions} from '@temporalio/worker';
import {WorkflowError} from '@temporalio/workflow';
import {getDefaultLogger} from '@utils/logger';
import {Express, Request, Response} from 'express';
import {Logger} from 'winston';

export interface JobarOptions {
	app: Express;
	workflowsPath: string;
	temporalAddress: string;
	logger?: Logger;
	logLevel?: string;
	namespace?: string;
	onRequestError: (context: JobarRequestContextError) => any;
	activities: WorkerOptions['activities'];
	useUniqueWorkflowId?: Boolean;
}

export interface JobarRequestContextError {
	workflowId: string;
	workflowError: WorkflowError;
	initialError: Error;
	request: Request;
	response: Response;
	jobarInstance: Jobar;
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
	onRequestError: (context: JobarRequestContextError) => any;
	connection?: NativeConnection;
	useUniqueWorkflowId: Boolean;

	constructor({
		app,
		workflowsPath,
		temporalAddress,
		logger,
		logLevel = 'debug',
		namespace = 'default',
		onRequestError,
		activities,
		useUniqueWorkflowId = false,
	}: JobarOptions) {
		this.app = app;
		this.temporalAddress = temporalAddress;
		this.workflowsPath = workflowsPath;
		this.logLevel = logger?.level ?? logLevel;
		this.namespace = namespace;
		this.logger = logger ?? getDefaultLogger(this.logLevel);
		this.onRequestError = onRequestError;
		this.activities = activities;
		this.useUniqueWorkflowId = useUniqueWorkflowId;
	}

	addTaskQueue(...taskQueues: Array<TaskQueue>) {
		taskQueues.forEach((taskQueue) => {
			if (this.tasksQueues.map((taskQueue) => taskQueue.name).includes(taskQueue.name)) {
				throw new Error(`❌ A TaskQueue with same name as "${taskQueue.name}" already exist in this instance.`);
			}
			this.tasksQueues.push(taskQueue);
		});
		return this;
	}

	/* istanbul ignore next */
	async run() {
		this.logger.info(`🚀 Try to connect to temporal on ${this.temporalAddress}..`);
		this.connection = await NativeConnection.connect({
			address: this.temporalAddress,
		});
		this.logger.info(`✅ Connected to temporal`);
		for (const taskQueue of this.tasksQueues) {
			taskQueue.run(this);
		}
	}
}
