import {Workflow, WorkflowStartOptions} from '@temporalio/client';
import {WorkflowCoverage} from '@temporalio/nyc-test-coverage';
import {TestWorkflowEnvironment} from '@temporalio/testing';
import {DefaultLogger, Runtime, Worker, WorkerOptions} from '@temporalio/worker';
import {HelloWorld} from '@workflows';
import assert from 'assert';
import {describe, it} from 'mocha';
import sinon from 'sinon';
import {v4 as uuid} from 'uuid';

const workflowCoverage = new WorkflowCoverage();

describe('Workflow login', async function () {
	this.slow(10000);
	this.timeout(20000);
	const workflowFn = HelloWorld;
	const workflowStartOptions: Partial<WorkflowStartOptions<typeof workflowFn>> = {
		args: [
			{
				name: 'Temporal',
			},
		],
	};
	const sayHelloStub = sinon.stub();
	const sayHelloSuccessResult = 'Hello, Temporal !';

	let env: TestWorkflowEnvironment;

	before(async () => {
		Runtime.install({logger: new DefaultLogger('WARN')});
		env = await TestWorkflowEnvironment.createLocal();
	});

	beforeEach(() => {
		sayHelloStub.resolves(sayHelloSuccessResult);
	});

	afterEach(() => {
		sinon.reset();
	});

	after(async () => {
		await env.teardown();
		workflowCoverage.mergeIntoGlobalCoverage();
		sinon.restore();
	});

	async function executeTestWithWorker<W extends Workflow = Workflow>(
		env: TestWorkflowEnvironment,
		workerOptions: Pick<WorkerOptions, 'activities'>,
		workflowFn: W,
		workflowStartOptions: Partial<WorkflowStartOptions<W>> = {},
		workflowCoverage?: WorkflowCoverage
	) {
		const taskQueue = `test-taskqueue-${uuid()}`;

		const finalWorkerOptions = {
			...workerOptions,
			activities: {...workerOptions.activities},
			connection: env.nativeConnection,
			taskQueue,
			workflowsPath: require.resolve('..'),
		};

		const worker = await Worker.create(workflowCoverage ? workflowCoverage.augmentWorkerOptions(finalWorkerOptions) : finalWorkerOptions);

		return await worker.runUntil(async () =>
			env.client.workflow.execute(workflowFn, {
				taskQueue,
				workflowId: `test-${uuid()}`,
				...workflowStartOptions,
			} as WorkflowStartOptions<W>)
		);
	}

	it('successfull execution', async () => {
		const result = await executeTestWithWorker(
			env,
			{activities: {sayHello: sayHelloStub}},
			workflowFn,
			workflowStartOptions,
			workflowCoverage
		);

		assert.deepStrictEqual(sayHelloSuccessResult, result);
	});
});
