import {TaskQueue} from '@models/taskQueue';
import assert from 'assert';
import {Task} from '.';

describe('Task', () => {
	const mockWorkflow = async () => 'workflow result'; // Simuler une fonction de workflow

	let task: Task;

	beforeEach(() => {
		const taskQueue = new TaskQueue('testQueue');
		task = new Task(mockWorkflow, {
			isExposed: true,
			method: 'post',
			endpoint: '/tasks/mockWorkflow',
			scheduleOptions: {
				scheduleId: '',
				spec: {intervals: [{every: '1h'}]},
				action: {
					type: 'startWorkflow',
				},
			},
		});
		taskQueue.addTask(task);
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
	});

	describe('info', () => {
		it('should return the correct info', () => {
			assert.equal(task.info, 'Task mockWorkflow [POST /tasks/mockWorkflow]');
		});

		it('should return correct info when not exposed', () => {
			const task = new Task(mockWorkflow);
			assert.strictEqual(task.info, 'Task mockWorkflow');
		});
	});

	describe('setTaskQueue', () => {
		it("should throw an error if the taskQueue don't have the task", () => {
			const taskQueue2 = new TaskQueue('testQueue2');
			assert.throws(
				() => {
					task.setTaskQueue(taskQueue2);
				},
				{
					message: "❌ The taskQueue testQueue2 don't have the task mockWorkflow",
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

	describe('isScheduled', () => {
		it('should return true if the task is scheduled', () => {
			assert.strictEqual(task.isScheduled, true);
		});

		it('should return false if the task is not scheduled', () => {
			const task = new Task(mockWorkflow);
			assert.strictEqual(task.isScheduled, false);
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
