import assert from 'assert';
import {Workflow} from '.';

describe('Workflow', () => {
	describe('handle()', () => {
		it('should return the result of the handler when successful', async () => {
			const result = await Workflow.handle(async () => {
				return 'Success';
			});
			assert.strictEqual(result, 'Success');
		});

		it('should throw the cause of the error when handler fails', async () => {
			const errorCause = new Error('Original error');
			const failingHandler = async () => {
				throw {cause: errorCause}; // Simule une erreur avec une cause
			};

			try {
				await Workflow.handle(failingHandler);
				assert.fail('Expected method to throw.');
			} catch (error) {
				assert.strictEqual(error, errorCause);
			}
		});

		it('should throw undefined when error has no cause', async () => {
			const failingHandler = async () => {
				throw new Error('No cause error'); // Simule une erreur sans cause
			};

			try {
				await Workflow.handle(failingHandler);
				assert.fail('Expected method to throw.');
			} catch (error) {
				assert.strictEqual(error, undefined);
			}
		});
	});
});
