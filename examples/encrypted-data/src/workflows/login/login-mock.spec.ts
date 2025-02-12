import {WorkflowFailedError} from '@temporalio/client';
import {MockActivityEnvironment, TestWorkflowEnvironment} from '@temporalio/testing';
import {Worker} from '@temporalio/worker';
import assert from 'assert';
import {JobarError} from 'jobar';
import {before, describe, it} from 'mocha';
import {login} from '.';

describe('Login workflow with mocks', () => {
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
				hardcodedPasswordLogin: async () => 'Hello, Temporal !',
			},
		});

		const result = await worker.runUntil(
			client.workflow.execute(login, {
				args: [{username: 'Temporal', password: 'temporal'}],
				workflowId: 'test',
				taskQueue,
			})
		);

		assert.equal(result, 'Hello, Temporal !');
	}).timeout(20000); // 20 sec

	it('fail the Workflow', async () => {
		const env = new MockActivityEnvironment();
		const {client, nativeConnection} = testEnv;
		const taskQueue = 'test';
		const error = 'Invalid Request';

		const worker = await Worker.create({
			connection: nativeConnection,
			taskQueue,
			workflowsPath: require.resolve('..'),
			activities: {
				hardcodedPasswordLogin: async () => {
					throw new JobarError('Unauthorized', {
						statusCode: 401,
						errorCode: 'unauthorized',
						description: 'Bad credentials',
					});
				},
			},
		});

		const workflowCall = () => {
			return worker.runUntil(
				client.workflow.execute(login, {
					args: [{username: 'Temporal', password: 'bad password'}],
					workflowId: 'test',
					taskQueue,
				})
			);
		};

		try {
			const result = await env.run(workflowCall);
		} catch (error: any) {
			const activityError = error.cause;
			const jobarError = activityError?.cause;
			const activityResponse = JSON.parse(jobarError?.message ?? '');
			assert(error instanceof WorkflowFailedError);
			assert.equal(activityResponse.message, 'Unauthorized');
			assert.equal(activityResponse.statusCode, 401);
			assert.equal(activityResponse.errorCode, 'unauthorized');
		}
	}).timeout(20000); //20 sec
});
