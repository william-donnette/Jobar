import {MockActivityEnvironment} from '@temporalio/testing';
import assert from 'assert';
import {JobarError} from 'jobar';
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

		try {
			const result = await env.run(hardcodedPasswordLogin, username, password);
		} catch (error: any) {
			const activityResponse = JSON.parse(error.message);
			assert(error instanceof JobarError);
			assert.equal(activityResponse.message, 'Bad Credentials');
			assert.equal(activityResponse.options.statusCode, 401);
			assert.equal(activityResponse.options.error, 'nauthorized');
		}
	});
});
