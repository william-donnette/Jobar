import assert from 'assert';
import {TaskQueue} from '.';
import {Task} from '../task';

describe('TaskQueue', () => {
	let taskQueue: TaskQueue;

	beforeEach(() => {
		taskQueue = TaskQueue.create('testQueue');
	});

	afterEach(() => {
		TaskQueue.clear();
	});

	describe('create()', () => {
		it('should create a TaskQueue with the specified name', () => {
			assert.strictEqual(taskQueue.name, 'testQueue');
		});

		it('should throw an error when creating a TaskQueue with the same name', () => {
			assert.throws(
				() => {
					TaskQueue.create('testQueue'); // Réessaye de créer une TaskQueue avec le même nom
				},
				{
					message: 'A TaskQueue with same name already exist.',
				}
			);
		});
	});

	describe('clear()', () => {
		it('should remove all the TaskQueues', () => {
			TaskQueue.clear();
			assert.strictEqual(TaskQueue.tasksQueues.length, 0);
		});
	});

	describe('addTask()', () => {
		const mockWorkflow = async () => 'workflow result';
		let task: Task;

		beforeEach(() => {
			task = new Task(mockWorkflow, {isExposed: true});
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
					message: 'This task is already in this taskQueue.',
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
			task = new Task(mockWorkflow, {isExposed: true, method: 'get'});
		});
		it("should return the infos of it's exposedTasks", async () => {
			taskQueue.addTask(task);
			assert.equal(taskQueue.infos.length, 1);
			assert.equal(taskQueue.infos[0], 'GET /tasks/mockWorkflow');
		});
	});
});
