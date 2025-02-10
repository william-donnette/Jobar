import {MockActivityEnvironment} from '@temporalio/testing';
import assert from 'assert';
import {describe, it} from 'mocha';
import {sayHello} from '.';

describe('sayHello activity', async () => {
	it('successfully sayHello', async () => {
		const env = new MockActivityEnvironment();
		const name = 'Temporal';
		const result = await env.run(sayHello, name);
		assert.equal(result, 'Hello, Temporal !');
	});
});
