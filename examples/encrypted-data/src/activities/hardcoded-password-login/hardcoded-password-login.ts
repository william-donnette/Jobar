export async function hardcodedPasswordLogin(username: string, password: string): Promise<string> {
	if (password !== 'temporal') {
		throw new Error('Unauthorized')
	}
	return `Hello, ${username} !`;
}
