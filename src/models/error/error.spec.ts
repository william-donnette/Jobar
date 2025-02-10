import assert from 'assert';
import {JobarError} from '.';

describe('JobarError', () => {
	it('should create a JobarError instance with default values', () => {
		const error = new JobarError('Test error');
		const parsedError = JSON.parse(error.message);
		assert.strictEqual(parsedError.isJobarError, true);
		assert.strictEqual(parsedError.message, 'Test error');
		assert.strictEqual(parsedError.errorCode, 'internal_server_error');
		assert.strictEqual(parsedError.description, 'Activity task failed');
	});

	it('should create a JobarError instance with custom values', () => {
		const error = new JobarError('Custom error', {statusCode: 404, errorCode: 'not_found', description: 'Resource not found'});
		const parsedError = JSON.parse(error.message);
		assert.strictEqual(parsedError.isJobarError, true);
		assert.strictEqual(parsedError.message, 'Custom error');
		assert.strictEqual(parsedError.statusCode, 404);
		assert.strictEqual(parsedError.errorCode, 'not_found');
		assert.strictEqual(parsedError.description, 'Resource not found');
	});
});
