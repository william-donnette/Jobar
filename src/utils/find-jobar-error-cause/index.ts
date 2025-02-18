export const findLastError = (error: any): Error => {
	if (error.cause) {
		return findLastError(error.cause);
	}
	return error;
};
