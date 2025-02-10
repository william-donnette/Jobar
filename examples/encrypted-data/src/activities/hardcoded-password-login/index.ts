import {JobarError} from '../../../../../dist';

export async function hardcodedPasswordLogin(username: string, password: string): Promise<string> {
	if (password !== 'temporal') {
		throw new JobarError('Unauthorized', {
			statusCode: 401,
			errorCode: 'unauthorized',
			description: 'Bad credentials.',
		});
	}
	return `Hello, ${username} !`;
}
