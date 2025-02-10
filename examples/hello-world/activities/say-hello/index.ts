import {Activity} from 'jobar';

export async function sayHello(name: string): Promise<string> {
	return await Activity.handle<string>(async () => {
		return `Hello, ${name} !`;
	});
}
