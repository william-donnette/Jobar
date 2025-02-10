import {TestWorkflowEnvironment} from '@temporalio/testing';
import {Worker} from '@temporalio/worker';
import assert from 'assert';
import {before, describe, it} from 'mocha';
import {HelloWorld} from '.';

describe('HelloWorld workflow with mocks', () => {
	let testEnv: TestWorkflowEnvironment;

	before(async () => {
		testEnv = await TestWorkflowEnvironment.createLocal();
	});

	after(async () => {
		await testEnv?.teardown();
	});

	it('successfully completes the Workflow with a mocked Activity', async () => {
		const {client, nativeConnection} = testEnv;
		const taskQueue = 'test';

		const worker = await Worker.create({
			connection: nativeConnection,
			taskQueue,
			workflowsPath: require.resolve('..'),
			activities: {
				sayHello: async () => 'Hello, Temporal !',
			},
		});

		const result = await worker.runUntil(
			client.workflow.execute(HelloWorld, {
				args: [{name: 'Temporal'}],
				workflowId: 'test',
				taskQueue,
			})
		);

		assert.equal(result, 'Hello, Temporal !');
	}).timeout(20000); // 20 sec
});
