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
		});
	});

	it('should initialize with default values', () => {
		assert.strictEqual(jobar.logLevel, 'debug');
		assert.strictEqual(jobar.namespace, 'default');
		assert.strictEqual(jobar.defaultStatusCodeError, 500);
	});

	it('should override default values when provided', () => {
		const customLogger = getDefaultLogger('info');
		jobar = new Jobar({
			app,
			workflowsPath: './workflows',
			temporalAddress: 'localhost:7233',
			logLevel: 'info',
			namespace: 'customNamespace',
			defaultStatusCodeError: 400,
			logger: customLogger,
		});

		assert.strictEqual(jobar.logLevel, 'info');
		assert.strictEqual(jobar.namespace, 'customNamespace');
		assert.strictEqual(jobar.defaultStatusCodeError, 400);
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
		assert.throws(() => jobar.addTaskQueue(taskQueue2), /A TaskQueue with same name already exist/);
	});

	it('should create a JobarError default instance', () => {
		const error = Jobar.error('Test error');
		const parsedMessage = JSON.parse(error.message);
		assert.strictEqual(parsedMessage.message, 'Test error');
		assert.strictEqual(parsedMessage.options.error, 'Internal Server Error');
	});

	it('should create a JobarError instance', () => {
		const error = Jobar.error('Test error', {error: 'E_TEST'});
		const parsedMessage = JSON.parse(error.message);
		assert.strictEqual(parsedMessage.message, 'Test error');
		assert.strictEqual(parsedMessage.options.error, 'E_TEST');
	});
});
