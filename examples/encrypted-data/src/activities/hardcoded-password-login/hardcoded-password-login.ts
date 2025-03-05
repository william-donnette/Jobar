export async function hardcodedPasswordLogin(username: string, password: string): Promise<string> {
	if (password !== 'temporal') {
		throw new Error('Bad Credentials')
	}
	return `Hello, ${username} !`;
}
