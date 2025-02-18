import assert from 'assert';
import {JobarError} from '.';

describe('JobarError', () => {
	it('should create a JobarError instance with default values', () => {
		const error = new JobarError('Test error');
		const parsedError = JSON.parse(error.message);
		assert.strictEqual(parsedError.isJobarError, true);
		assert.strictEqual(parsedError.message, 'Test error');
		assert.strictEqual(parsedError.options.statusCode, undefined);
		assert.strictEqual(parsedError.options.error, 'Internal Server Error');
		assert.notStrictEqual(parsedError.options.details, {activity: 'Activity Task Failed.', workflow: 'Internal Server Error.'});
	});

	it('should create a JobarError instance with custom values', () => {
		const error = new JobarError('Custom error', {statusCode: 404, error: 'Not Found', details: 'Resource not found'});
		const parsedError = JSON.parse(error.message);
		assert.strictEqual(parsedError.isJobarError, true);
		assert.strictEqual(parsedError.message, 'Custom error');
		assert.strictEqual(parsedError.options.statusCode, 404);
		assert.strictEqual(parsedError.options.error, 'Not Found');
		assert.strictEqual(parsedError.options.details, 'Resource not found');
	});
});
