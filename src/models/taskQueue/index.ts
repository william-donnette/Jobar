import {Client, ClientOptions, Connection, ConnectionOptions, DataConverter} from '@temporalio/client';
import {NativeConnection, Worker, WorkerOptions} from '@temporalio/worker';
import {Express} from 'express';
import {Logger} from 'winston';
import {camelize} from '../../utils/camelize';
import {Task, TaskConfig} from '../task';

export interface TaskQueueOptions {
	getDataConverter?: () => Promise<DataConverter>;
	connectionOptions?: ConnectionOptions;
	clientOptions?: ClientOptions;
}

interface TaskQueueConfig {
	temporalAddress: string;
	namespace: string;
	logger: Logger;
	app: Express;
	connection: NativeConnection;
	workerOptions?: WorkerOptions;
}

export class TaskQueue {
	private readonly tasks: Array<Task> = [];
	private readonly options: TaskQueueOptions = {};
	private _name: string;

	constructor(_name: string, options: TaskQueueOptions = {}) {
		this._name = _name;
		this.options = options;
	}

	get name() {
		return camelize(this._name);
	}

	addTask(task: Task) {
		if (this.hasTask(task)) {
			throw new Error('❌ This task is already in this taskQueue.');
		}
		if (this.hasSimilarTask(task)) {
			throw new Error('❌ A similar task is already in this taskQueue.');
		}
		this.tasks.push(task);
		task.setTaskQueue(this);
		return this;
	}

	hasTask(task: Task) {
		return this.tasks.map((task) => task.name).includes(task.name);
	}

	hasSimilarTask(task: Task) {
		return this.tasks.map((task) => `${task.info}`).includes(task.info);
	}

	private get exposedTasks() {
		return this.tasks.filter((task) => task.isValid && task.isExposed);
	}

	get infos() {
		return this.exposedTasks.map((task) => task.info);
	}

	/* istanbul ignore next */
	private async getDataConverter() {
		const {getDataConverter} = this.options;
		return getDataConverter ? await getDataConverter() : Promise.resolve(undefined);
	}

	/* istanbul ignore next */
	async createNewConnection(config: TaskConfig) {
		const {temporalAddress, logger} = config;
		const {connectionOptions} = this.options;
		logger.debug(`New connection on ${connectionOptions?.address ?? temporalAddress}`);
		return await Connection.connect({
			address: temporalAddress,
			...connectionOptions,
		});
	}

	/* istanbul ignore next */
	async createNewClient(config: TaskConfig) {
		const {namespace, logger} = config;
		const {clientOptions} = this.options;
		const connection = await this.createNewConnection(config);
		const dataConverter = await this.getDataConverter();
		const isCrypted = !!dataConverter;
		logger.debug(`${isCrypted ? '🔐 New crypted' : 'New'} client on ${clientOptions?.namespace ?? namespace}`);
		return new Client({
			connection,
			namespace: namespace,
			dataConverter,
			...clientOptions,
		});
	}

	/* istanbul ignore next */
	async createWorker(config: TaskQueueConfig) {
		const {connection, workerOptions, namespace} = config;
		return await Worker.create({
			connection,
			namespace: namespace,
			taskQueue: this.name,
			dataConverter: await this.getDataConverter(),
			...workerOptions,
		});
	}

	/* istanbul ignore next */
	async run(config: TaskQueueConfig) {
		const {app, logger, namespace, temporalAddress} = config;
		const worker = await this.createWorker(config);
		logger.info(`🚩 ${this._name.toUpperCase()} installation`);
		worker.run();
		for (const task of this.tasks) {
			logger.info(`🚀 ${task.name} is running`);
			if (task.isExposed) {
				task.run({app, logger, namespace, temporalAddress});
			}
		}
	}
}
