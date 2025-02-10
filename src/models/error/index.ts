interface JobarErrorOptions {
	statusCode?: number;
	errorCode?: string | number;
	description?: string;
}

export class JobarError extends Error {
	constructor(message: string, options: JobarErrorOptions = {}) {
		const {statusCode, errorCode, description} = options;
		super(
			JSON.stringify({
				isJobarError: true,
				message,
				statusCode,
				errorCode: errorCode ?? 'internal_server_error',
				description: description ?? 'Activity task failed',
			})
		);
	}
}
