import {ActivityFailure} from '@temporalio/client';

export abstract class Workflow {
	static async handle(handler: Function) {
		try {
			return await handler();
		} catch (error: unknown) {
			const typedError = error as ActivityFailure;
			throw typedError?.cause;
		}
	}
}
