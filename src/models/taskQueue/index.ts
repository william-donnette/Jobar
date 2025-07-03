import {Task} from '@models/task';
import {Jobar} from '@src/jobar';
import {Client, ClientOptions, Connection, ConnectionOptions, DataConverter} from '@temporalio/client';
import {Worker} from '@temporalio/worker';
import {camelize} from '@utils/camelize';

export interface TaskQueueOptions {
	getDataConverter?: () => Promise<DataConverter>;
	connectionOptions?: Omit<ConnectionOptions, 'address'>;
	clientOptions?: Omit<ClientOptions, 'dataConverter' | 'connection' | 'namespace'>;
	workerOptions?: Omit<WorkerOptions, 'connection' | 'namespace' | 'taskQueue' | 'dataConverter' | 'workflowsPath' | 'activities'>;
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

	get isCrypted() {
		return !!this.options.getDataConverter;
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
		logger.debug(`New connection on ${temporalAddress}`);
		return await Connection.connect({
			...connectionOptions,
			address: temporalAddress,
		});
	}

	/* istanbul ignore next */
	async createNewClient(jobarInstance: Jobar) {
		const {namespace, logger} = jobarInstance;
		const {clientOptions} = this.options;
		const connection = await this.createNewConnection(jobarInstance);
		logger.debug(`${this.isCrypted ? '🔐 New crypted' : 'New'} client on ${namespace}`);
		return new Client({
			...clientOptions,
			connection,
			namespace: namespace,
			dataConverter: await this.getDataConverter(),
		});
	}

	/* istanbul ignore next */
	async createWorker(jobarInstance: Jobar) {
		const {activities, workflowsPath, namespace, connection} = jobarInstance;
		const workerOptions = this.options.workerOptions ?? jobarInstance.workerOptions;
		return await Worker.create({
			...workerOptions,
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
