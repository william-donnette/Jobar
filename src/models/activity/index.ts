import {ApplicationFailure} from '@temporalio/client';

export abstract class Activity {
	static async handle<T>(handler: () => Promise<T>): Promise<T> {
		try {
			return await handler();
		} catch (error: any) {
			throw ApplicationFailure.create({
				message: error.message,
				nonRetryable: error.nonRetryable ?? true,
				cause: error.cause ?? new Error('internal_server_error'),
			});
		}
	}
}
