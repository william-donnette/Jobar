import assert from 'assert';
import {tryWithoutError} from '.';

describe('tryWithoutError', () => {
	it('should return the result of a successful callback', async () => {
		const result = await tryWithoutError(async () => 'success');
		assert.strictEqual(result, 'success');
	});

	it('should return undefined if the callback throws an error', async () => {
		const result = await tryWithoutError(async () => {
			throw new Error('Test error');
		});
		assert.strictEqual(result, undefined);
	});
});
