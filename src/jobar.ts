import {TaskQueue} from '@models/taskQueue';
import {Client, ClientOptions, Connection, ConnectionOptions, WorkflowStartOptions} from '@temporalio/client';
import {Logger, NativeConnection, WorkerOptions} from '@temporalio/worker';
import {WorkflowError} from '@temporalio/workflow';
import {getDefaultLogger, LogLevel} from '@utils/logger';
import {Express, Request, Response} from 'express';
import {TaskOptions, WorkflowResult} from './models';

export type WorkflowContextWrapper = <T = WorkflowResult>(
	startWorkflow: (options?: Partial<WorkflowStartOptions>) => Promise<T>,
	context: JobarWorkflowContext
) => Promise<T>;

export interface JobarOptions {
	app: Express;
	workflowsPath: string;
	temporalAddress: string;
	logger?: Logger;
	logLevel?: LogLevel;
	namespace?: string;
	onRequestError: (context: JobarRequestContextError) => any;
	activities: WorkerOptions['activities'];
	useUniqueWorkflowId?: Boolean;
	workflowContextWrapper?: WorkflowContextWrapper;
	connectionOptions?: Omit<ConnectionOptions, 'address'>;
	clientOptions?: Omit<ClientOptions, 'dataConverter' | 'connection' | 'namespace'>;
	workerOptions?: Omit<WorkerOptions, 'connection' | 'namespace' | 'taskQueue' | 'dataConverter' | 'workflowsPath' | 'activities'>;
}

export interface JobarRequestContextError {
	workflowId: string;
	workflowError: WorkflowError;
	initialError: Error;
	request: Request;
	response: Response;
	jobarInstance: Jobar;
}

export interface JobarWorkflowContext {
	workflowStartOptions: WorkflowStartOptions;
	taskOptions: TaskOptions;
	jobarInstance: Jobar;
	request: Request;
	response: Response;
}

export class Jobar {
	private readonly tasksQueues: Array<TaskQueue> = [];
	readonly app: Express;
	readonly activities: WorkerOptions['activities'];
	readonly workflowsPath: string;
	readonly temporalAddress: string;
	readonly logger: Logger;
	readonly namespace: string;
	readonly onRequestError: (context: JobarRequestContextError) => any;
	#connection?: NativeConnection;
	readonly useUniqueWorkflowId: Boolean;
	readonly workflowContextWrapper?: WorkflowContextWrapper;
	readonly connectionOptions?: Omit<ConnectionOptions, 'address'>;
	readonly clientOptions?: Omit<ClientOptions, 'dataConverter' | 'connection' | 'namespace'>;
	readonly workerOptions?: Omit<WorkerOptions, 'connection' | 'namespace' | 'taskQueue' | 'dataConverter' | 'workflowsPath' | 'activities'>;

	constructor({
		app,
		workflowsPath,
		temporalAddress,
		logLevel = 'DEBUG',
		logger,
		namespace = 'default',
		onRequestError,
		activities,
		useUniqueWorkflowId = false,
		workflowContextWrapper,
		workerOptions,
		clientOptions,
		connectionOptions,
	}: JobarOptions) {
		this.app = app;
		this.temporalAddress = temporalAddress;
		this.workflowsPath = workflowsPath;
		this.namespace = namespace;
		this.logger = logger ?? getDefaultLogger(logLevel);
		this.onRequestError = onRequestError;
		this.activities = activities;
		this.useUniqueWorkflowId = useUniqueWorkflowId;
		this.workflowContextWrapper = workflowContextWrapper;
		this.workerOptions = workerOptions;
		this.clientOptions = clientOptions;
		this.connectionOptions = connectionOptions;
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

	get connection() {
		return this.#connection;
	}

	/* istanbul ignore next */
	async createNewConnection(connectionOptions?: ConnectionOptions) {
		this.logger.debug(`New connection on ${connectionOptions?.address ?? this.temporalAddress}`);
		return await Connection.connect({
			address: this.temporalAddress,
			...connectionOptions,
		});
	}

	/* istanbul ignore next */
	async createNewClient(clientOptions?: ClientOptions, connectionOptions?: ConnectionOptions) {
		const connection = await this.createNewConnection(connectionOptions);
		const dataConverter = clientOptions?.dataConverter;
		const isCrypted = !!dataConverter;
		this.logger.debug(`${isCrypted ? '🔐 New crypted' : 'New'} client on ${clientOptions?.namespace ?? this.namespace}`);
		return new Client({
			connection,
			namespace: this.namespace,
			dataConverter,
			...clientOptions,
		});
	}

	/* istanbul ignore next */
	async run() {
		this.logger.info(`🚀 Try to connect to temporal on ${this.temporalAddress}..`);
		this.#connection = await NativeConnection.connect({
			address: this.temporalAddress,
		});
		this.logger.info(`✅ Connected to temporal`);
		for (const taskQueue of this.tasksQueues) {
			await taskQueue.run(this);
		}
	}
}
