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
					workflowType: mockWorkflow,
					taskQueue: taskQueue.name,
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

		it('should return undefined', () => {
			const taskWithoutMethod = new Task(mockWorkflow, {isExposed: true});
			assert.strictEqual(taskWithoutMethod.method, undefined);
		});
	});

	describe('info', () => {
		it('should return the correct info', () => {
			assert.equal(task.info, 'Task mockWorkflow is exposed on POST /tasks/mockWorkflow');
		});

		it('should return correct info when not exposed', () => {
			const task = new Task(mockWorkflow);
			assert.strictEqual(task.info, 'Task mockWorkflow');
		});
	});

	describe('needWorkflowFullRequest', () => {
		it('should return correct needWorkflowFullRequest value', () => {
			const task2 = new Task(mockWorkflow, {
				needWorkflowFullRequest: true,
			});
			assert.strictEqual(task.needWorkflowFullRequest, false);
			assert.strictEqual(task2.needWorkflowFullRequest, true);
		});
	});

	describe('getWorkflowId', () => {
		it('should return formatted workflow id', () => {
			const task = new Task(mockWorkflow, {
				setWorkflowId: (req) => 'custom-id',
			});
			const request: any = {};
			assert.strictEqual(task.getWorkflowId(request), 'custom-id');
		});

		it('should return formatted workflow id', () => {
			const request: any = {};
			assert.strictEqual(task.getWorkflowId(request), 'workflow-mockworkflow');
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
