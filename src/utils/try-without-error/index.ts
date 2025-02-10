export const tryWithoutError: <T>(callback: () => Promise<T>) => Promise<void | T> = async (callback) => {
	try {
		return await callback();
	} catch (err) {}
};
