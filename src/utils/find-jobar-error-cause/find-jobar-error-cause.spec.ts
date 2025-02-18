import {ApplicationFailure} from '@temporalio/workflow';
import assert from 'assert';
import {findLastError} from '.';

describe('findLastError', () => {
	it('should return the error itself if it has no cause', () => {
		const error = new Error('Simple error');
		assert.strictEqual(findLastError(error), error);
	});

	it('should return the last cause in a chain of nested errors', () => {
		const rootError = new Error('Root error');
		const middleError = new ApplicationFailure('Intermediate error', 'Error', true, [], rootError);
		const topError = new ApplicationFailure('Top error', 'Error', true, [], middleError);

		assert.strictEqual(findLastError(topError), rootError);
	});

	it('should handle a mix of errors with and without causes', () => {
		const rootError = new Error('Root error');
		const middleError = new ApplicationFailure('Intermediate error', 'Error', true, [], rootError);
		const topError = new ApplicationFailure('Top error', 'Error', true, [], middleError);

		const isolatedError = new Error('Isolated error');

		assert.strictEqual(findLastError(topError), rootError);
		assert.strictEqual(findLastError(isolatedError), isolatedError);
	});
});
