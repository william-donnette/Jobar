import {MockActivityEnvironment} from '@temporalio/testing';
import assert from 'assert';
import {describe, it} from 'mocha';
import {hardcodedPasswordLogin} from './hardcoded-password-login';

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

		await assert.rejects(
			env.run(hardcodedPasswordLogin, username, password),
			(error: any) => error.message === 'Unauthorized'
		);
	});
});
