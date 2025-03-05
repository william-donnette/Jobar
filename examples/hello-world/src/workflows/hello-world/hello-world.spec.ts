// @@@SNIPSTART hello-world-project-template-ts-workflow-test
import activities from '@activities';
import {TestWorkflowEnvironment} from '@temporalio/testing';
import {Worker} from '@temporalio/worker';
import assert from 'assert';
import {before, describe, it} from 'mocha';
import {HelloWorld} from '.';

describe('HelloWorld workflow', () => {
	let testEnv: TestWorkflowEnvironment;

	before(async () => {
		testEnv = await TestWorkflowEnvironment.createLocal();
	});

	after(async () => {
		await testEnv?.teardown();
	});

	it('successfully completes the Workflow', async () => {
		const {client, nativeConnection} = testEnv;
		const taskQueue = 'test';

		const worker = await Worker.create({
			connection: nativeConnection,
			taskQueue,
			workflowsPath: require.resolve('..'),
			activities: activities,
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
// @@@SNIPEND
