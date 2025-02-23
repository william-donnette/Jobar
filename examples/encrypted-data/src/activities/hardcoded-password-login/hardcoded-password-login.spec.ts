import {MockActivityEnvironment} from '@temporalio/testing';
import assert from 'assert';
import {describe, it} from 'mocha';
import {hardcodedPasswordLogin} from '.';

describe('hardcodedPasswordLogin activity', async () => {
	it('successfully login', async () => {
		const env = new MockActivityEnvironment();
		const username = 'Temporal';
		const password = 'temporal';
		const result = await env.run(hardcodedPasswordLogin, username, password);
		assert.equal(result, 'Hello, Temporal !');
	});

	it('failed login', async () => {
		const env = new MockActivityEnvironment();
		const username = 'Temporal';
		const password = 'bad password';

		return await assert.rejects(
			async () => await env.run(hardcodedPasswordLogin, username, password),
			(error) => error instanceof Error && error.message === 'Bad Credentials'
		);
	});
});
