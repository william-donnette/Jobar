import assert from 'assert';
import {JobarError} from '.';

describe('JobarError', () => {
	it('should create a JobarError instance with default values', () => {
		const error = new JobarError('Test error');
		const parsedError = JSON.parse(error.message);
		assert.strictEqual(parsedError.isJobarError, true);
		assert.strictEqual(parsedError.message, 'Test error');
		assert.strictEqual(parsedError.status, 500);
		assert.strictEqual(parsedError.error, 'internal_server_error');
		assert.notStrictEqual(parsedError.details, {activity: 'Activity Task Failed.', workflow: 'Internal Server Error.'});
	});

	it('should create a JobarError instance with custom values', () => {
		const error = new JobarError('Custom error', {status: 404, error: 'not_found', details: 'Resource not found'});
		const parsedError = JSON.parse(error.message);
		assert.strictEqual(parsedError.isJobarError, true);
		assert.strictEqual(parsedError.message, 'Custom error');
		assert.strictEqual(parsedError.status, 404);
		assert.strictEqual(parsedError.error, 'not_found');
		assert.strictEqual(parsedError.details, 'Resource not found');
	});
});
