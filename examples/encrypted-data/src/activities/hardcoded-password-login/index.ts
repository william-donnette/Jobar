import Jobar from 'jobar';

export async function hardcodedPasswordLogin(username: string, password: string): Promise<string> {
	if (password !== 'temporal') {
		throw Jobar.error('Bad Credentials', {
			statusCode: 401,
			error: 'Unauthorized',
			details: {
				password: 'Invalid',
				username: 'OK',
			},
		});
	}
	return `Hello, ${username} !`;
}
