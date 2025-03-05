import assert from 'assert';
import express, {Express} from 'express';
import Jobar from '.';
import {TaskQueue} from './models/taskQueue';
import {getDefaultLogger} from './utils/logger';

describe('Jobar', () => {
	let jobar: Jobar;
	let app: Express;

	beforeEach(() => {
		app = express();
		jobar = new Jobar({
			app,
			workflowsPath: './workflows',
			temporalAddress: 'localhost:7233',
			onRequestError: ({workflowError}) => {
				throw workflowError;
			},
			activities: [],
		});
	});

	it('should initialize with default values', () => {
		assert.strictEqual(jobar.logLevel, 'debug');
		assert.strictEqual(jobar.namespace, 'default');
	});

	it('should override default values when provided', () => {
		const customLogger = getDefaultLogger('info');
		jobar = new Jobar({
			app,
			workflowsPath: './workflows',
			temporalAddress: 'localhost:7233',
			logLevel: 'info',
			namespace: 'customNamespace',
			logger: customLogger,
			onRequestError: ({workflowError}) => {
				throw workflowError;
			},
			activities: [],
		});

		assert.strictEqual(jobar.logLevel, 'info');
		assert.strictEqual(jobar.namespace, 'customNamespace');
		assert.strictEqual(jobar.logger, customLogger);
	});

	it('should add a task queue successfully', () => {
		const taskQueue = new TaskQueue('queue1');
		jobar.addTaskQueue(taskQueue);
		assert.strictEqual(jobar['tasksQueues'].length, 1);
		assert.strictEqual(jobar['tasksQueues'][0], taskQueue);
	});

	it('should throw an error when adding a task queue with a duplicate name', () => {
		const taskQueue1 = new TaskQueue('queue1');
		const taskQueue2 = new TaskQueue('queue1');
		jobar.addTaskQueue(taskQueue1);
		assert.throws(() => jobar.addTaskQueue(taskQueue2), /A TaskQueue with same name as "queue1" already exist in this instance/);
	});

	it('should throw an error when adding a task queue with a duplicate name 2', () => {
		const taskQueue1 = new TaskQueue('queue1');
		const taskQueue2 = new TaskQueue('queue1');
		assert.throws(() => jobar.addTaskQueue(taskQueue1, taskQueue2), /A TaskQueue with same name as "queue1" already exist in this instance/);
	});
});
