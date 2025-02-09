export const tryWithoutError: (callback: Function) => Promise<void> = async (callback) => {
	try {
		await callback();
	} catch (err) {
		console.error(err);
	}
};
