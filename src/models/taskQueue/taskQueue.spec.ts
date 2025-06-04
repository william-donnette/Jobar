import {Task} from '@models/task';
import assert from 'assert';
import {TaskQueue} from '.';

describe('TaskQueue', () => {
	let taskQueue: TaskQueue;

	beforeEach(() => {
		taskQueue = new TaskQueue('testQueue');
	});

	describe('addTask()', () => {
		const mockWorkflow = async () => 'workflow result';
		let task: Task;

		beforeEach(() => {
			task = new Task(mockWorkflow, {isExposed: true, method: 'get', endpoint: '/'});
		});

		it('should add a task to the taskQueue', () => {
			taskQueue.addTask(task);
			assert.strictEqual(taskQueue.hasTask(task), true);
		});

		it('should throw an error when adding the same task twice', () => {
			taskQueue.addTask(task);
			assert.throws(
				() => {
					taskQueue.addTask(task);
				},
				{
					message: '❌ Task mockWorkflow is already in this taskQueue.',
				}
			);
		});
	});

	describe('hasTask()', () => {
		it('should return true if the task is in the queue', () => {
			const mockWorkflow = async () => 'workflow result';
			const task = new Task(mockWorkflow);
			taskQueue.addTask(task);
			assert.strictEqual(taskQueue.hasTask(task), true);
		});

		it('should return false if the task is not in the queue', () => {
			const mockWorkflow = async () => 'workflow result';
			const task = new Task(mockWorkflow);
			assert.strictEqual(taskQueue.hasTask(task), false);
		});
	});

	describe('infos', () => {
		const mockWorkflow = async () => 'workflow result';
		let task: Task;

		beforeEach(() => {
			task = new Task(mockWorkflow, {isExposed: true, method: 'get', endpoint: '/'});
		});
		it("should return the infos of it's exposedTasks", async () => {
			taskQueue.addTask(task);
			assert.equal(taskQueue.infos.length, 1);
			assert.equal(taskQueue.infos[0], 'Task mockWorkflow is exposed on GET /');
		});
	});
});
