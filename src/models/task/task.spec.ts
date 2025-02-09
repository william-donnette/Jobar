import assert from 'assert';
import {Task} from '.';
import {TaskQueue} from '../taskQueue';

describe('Task', () => {
	const mockWorkflow = async () => 'workflow result'; // Simuler une fonction de workflow

	let task: Task;

	beforeEach(() => {
		const taskQueue = TaskQueue.create('testQueue');
		task = new Task(mockWorkflow, {
			isExposed: true,
			method: 'post',
			path: 'mockWorkflow',
		});
		taskQueue.addTask(task);
	});

	afterEach(() => {
		TaskQueue.clear();
	});

	describe('name', () => {
		it('should return the camelized name of the workflow function', () => {
			assert.strictEqual(task.name, 'mockWorkflow');
		});
	});

	describe('url', () => {
		it('should return the correct URL', () => {
			assert.strictEqual(task.url, '/tasks/mockWorkflow');
		});
	});

	describe('method', () => {
		it('should return the correct HTTP method', () => {
			assert.strictEqual(task.method, 'post');
		});

		it('should throw an error if method is not set', () => {
			const taskWithoutMethod = new Task(mockWorkflow, {isExposed: true});
			assert.throws(() => taskWithoutMethod.method, {
				message: /Set methode to "get" \| "post" \| "put" \| "patch" \| "delete"/,
			});
		});
	});

	describe('info', () => {
		it('should return the correct info', () => {
			assert.strictEqual(task.info, 'POST /tasks/mockWorkflow');
		});
	});

	describe('setTaskQueue', () => {
		it("should throw an error if the taskQueue don't have the task", () => {
			const taskQueue2 = TaskQueue.create('testQueue2');
			assert.throws(
				() => {
					task.setTaskQueue(taskQueue2);
				},
				{
					message: "The taskQueue testQueue2 don't have the task mockWorkflow",
				}
			);
		});
	});

	describe('isExposed', () => {
		it('should return true if the task is exposed', () => {
			assert.strictEqual(task.isExposed, true);
		});

		it('should return false if the task is not exposed', () => {
			const task = new Task(mockWorkflow);
			assert.strictEqual(task.isExposed, false);
		});
	});

	describe('isValid', () => {
		it('should return true if the task is valid', () => {
			assert.strictEqual(task.isValid, true);
		});

		it('should return false if the task queue is not set', () => {
			const invalidTask = new Task(mockWorkflow);
			assert.strictEqual(invalidTask.isValid, false);
		});
	});
});
