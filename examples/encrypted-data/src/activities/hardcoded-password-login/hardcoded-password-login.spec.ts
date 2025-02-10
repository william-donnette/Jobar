import {MockActivityEnvironment} from '@temporalio/testing';
import assert from 'assert';
import {describe, it} from 'mocha';
import {hardcodedPasswordLogin} from '.';
import {JobarError} from '../../../../../dist';

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
			assert.equal(activityResponse.message, 'Unauthorized');
			assert.equal(activityResponse.statusCode, 401);
			assert.equal(activityResponse.errorCode, 'unauthorized');
		}
	});
});
