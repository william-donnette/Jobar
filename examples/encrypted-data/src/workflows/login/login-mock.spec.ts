import {WorkflowFailedError} from '@temporalio/client';
import {MockActivityEnvironment, TestWorkflowEnvironment} from '@temporalio/testing';
import {Worker} from '@temporalio/worker';
import assert from 'assert';
import {before, describe, it} from 'mocha';
import {login} from '.';
import { findInitialError } from 'jobar';

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
					throw new Error('Bad Credentials');
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

		return await assert.rejects(async () => await env.run(workflowCall), (error) => error instanceof WorkflowFailedError && error.message === 'Workflow execution failed' && findInitialError(error).message === 'Bad Credentials')
	}).timeout(20000); //20 sec
});
