import {proxyActivities} from '@temporalio/workflow';
import {Request} from 'express';
import activities from '../../activities';

const {sayHello} = proxyActivities<typeof activities>({
	startToCloseTimeout: '1 minute',
	retry: {
		maximumAttempts: 3,
	},
});

type HelloWorldInput = {
	name: string;
};

/* istanbul ignore next */
export async function HelloWorld(body: HelloWorldInput, headers?: Request['headers']): Promise<string> {
	/**
	 *
	 * WARNING !!!
	 * You can't add here buisness code that require other libraries
	 * Prefer use only buisness activities and track all the workflow on temporal dashboard
	 *
	 */

	const treatmentResponse = await sayHello(body.name);
	// Add other activities

	return treatmentResponse;
}
