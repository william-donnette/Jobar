import {ApplicationFailure} from '@temporalio/client';
import assert from 'assert';
import {Activity} from '.'; // Import de ta classe

describe('Activity', () => {
	describe('handle()', () => {
		it('should return the result of the handler when successful', async () => {
			const result = await Activity.handle(async () => {
				return 'Success';
			});
			assert.strictEqual(result, 'Success');
		});

		it('should throw an ApplicationFailure when handler fails', async () => {
			const message = 'Original error';
			const errorCause = new Error(message);
			const failingHandler = async () => {
				throw errorCause; // Simule une erreur
			};

			try {
				await Activity.handle(failingHandler);
				assert.fail('Expected method to throw.');
			} catch (error) {
				assert(error instanceof ApplicationFailure);
				assert.strictEqual(error.message, message);
				assert.strictEqual(error.nonRetryable, true);
				assert.deepStrictEqual(error.cause, new Error('internal_server_error'));
			}
		});

		it('should throw an ApplicationFailure with custom nonRetryable and cause when provided', async () => {
			const message = 'Custom error';
			const errorCause = new Error('Custom cause');
			const failingHandler = async () => {
				throw {message, nonRetryable: false, cause: errorCause};
			};

			try {
				await Activity.handle(failingHandler);
				assert.fail('Expected method to throw.');
			} catch (error) {
				assert(error instanceof ApplicationFailure);
				assert.strictEqual(error.message, message);
				assert.strictEqual(error.nonRetryable, false);
				assert.strictEqual(error.cause, errorCause);
			}
		});

		it('should throw ApplicationFailure with default cause when error has no cause', async () => {
			const message = 'No cause error';
			const failingHandler = async () => {
				throw new Error(message); // Simule une erreur sans cause spécifique
			};

			try {
				await Activity.handle(failingHandler);
				assert.fail('Expected method to throw.');
			} catch (error) {
				assert(error instanceof ApplicationFailure);
				assert.strictEqual(error.message, message);
				assert.strictEqual(error.nonRetryable, true);
				assert.deepStrictEqual(error.cause, new Error('internal_server_error'));
			}
		});
	});
});
