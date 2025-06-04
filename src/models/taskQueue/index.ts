import {Task} from '@models/task';
import {Jobar} from '@src/jobar';
import {Client, ClientOptions, Connection, ConnectionOptions, DataConverter} from '@temporalio/client';
import {Worker} from '@temporalio/worker';
import {camelize} from '@utils/camelize';

export interface TaskQueueOptions {
	getDataConverter?: () => Promise<DataConverter>;
	connectionOptions?: ConnectionOptions;
	clientOptions?: ClientOptions;
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

	addTask(...tasks: Array<Task>) {
		tasks.forEach((task) => {
			if (this.hasTask(task)) {
				throw new Error(`❌ Task ${task.name} is already in this taskQueue.`);
			}
			this.tasks.push(task);
			task.setTaskQueue(this);
		});
		return this;
	}

	hasTask(task: Task) {
		return this.tasks.map((task) => task.name).includes(task.name);
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
	async createNewConnection(jobarInstance: Jobar) {
		const {temporalAddress, logger} = jobarInstance;
		const {connectionOptions} = this.options;
		logger.debug(`New connection on ${connectionOptions?.address ?? temporalAddress}`);
		return await Connection.connect({
			address: temporalAddress,
			...connectionOptions,
		});
	}

	/* istanbul ignore next */
	async createNewClient(jobarInstance: Jobar) {
		const {namespace, logger} = jobarInstance;
		const {clientOptions} = this.options;
		const connection = await this.createNewConnection(jobarInstance);
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
	async createWorker(jobarInstance: Jobar) {
		const {activities, workflowsPath, namespace, connection} = jobarInstance;
		return await Worker.create({
			connection,
			namespace: namespace,
			taskQueue: this.name,
			dataConverter: await this.getDataConverter(),
			workflowsPath,
			activities,
		});
	}

	/* istanbul ignore next */
	async run(jobarInstance: Jobar) {
		const {logger} = jobarInstance;
		const worker = await this.createWorker(jobarInstance);
		logger.info(`🚩 ${this._name.toUpperCase()} installation`);
		worker.run();
		for (const task of this.tasks) {
			logger.info(`🚀 ${task.name} is running`);
			await task.run(jobarInstance);
		}
	}
}
