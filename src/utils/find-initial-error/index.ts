export const findInitialError = (error: any): Error => {
	if (error.cause) {
		return findInitialError(error.cause);
	}
	return error;
};
