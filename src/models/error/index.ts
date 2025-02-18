export interface JobarErrorOptions {
	statusCode?: number;
	error?: string;
	details?: any;
}

export class JobarError extends Error {
	options: JobarErrorOptions;
	isJobarError: boolean = true;

	constructor(message: string, options: JobarErrorOptions = {}) {
		const {
			statusCode,
			error = 'Internal Server Error',
			details = {
				activity: 'Activity Task Failed.',
				workflow: 'Internal Server Error.',
			},
		} = options;
		super(
			JSON.stringify({
				message,
				options: {
					statusCode,
					error,
					details,
				},
				isJobarError: true,
			})
		);
		this.options = options;
	}
}
