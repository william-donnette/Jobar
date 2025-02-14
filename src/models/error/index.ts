export interface JobarErrorOptions {
	status?: number;
	error?: string;
	details?: any;
}

export class JobarError extends Error {
	constructor(message: string, options: JobarErrorOptions = {}) {
		const {status = 500, error, details} = options;
		super(
			JSON.stringify({
				isJobarError: true,
				message,
				status,
				error: error ?? 'internal_server_error',
				details: details ?? {
					activity: 'Activity Task Failed.',
					workflow: 'Internal Server Error.',
				},
			})
		);
	}
}
