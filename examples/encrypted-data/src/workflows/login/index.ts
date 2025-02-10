import {proxyActivities} from '@temporalio/workflow';
import activities from '../../activities';

const {hardcodedPasswordLogin} = proxyActivities<typeof activities>({
	startToCloseTimeout: '1 minute',
	retry: {
		maximumAttempts: 3,
	},
});

type LoginInput = {
	username: string;
	password: string;
};

/* istanbul ignore next */
export async function login(body: LoginInput, headers?: Request['headers']): Promise<string> {
	/**
	 *
	 * WARNING !!!
	 * You can't add here buisness code that require other libraries
	 * Prefer use only buisness activities and track all the workflow on temporal dashboard
	 *
	 */
	try {
		const treatmentResponse = await hardcodedPasswordLogin(body.username, body.password);
		return treatmentResponse;
	} catch (e) {
		console.error(e);
		throw e;
	}
	// Add other activities
}
