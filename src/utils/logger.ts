import {createLogger, format, transports} from 'winston';

/* istanbul ignore next */
export const getDefaultLogger = (level: string) =>
	createLogger({
		level,
		transports: [
			new transports.Console({
				format: format.combine(
					format.colorize(),
					format.splat(),
					format.timestamp(),
					format.printf(({timestamp, level, message}) => {
						return `[${timestamp}] ${level}: ${message}`;
					})
				),
			}),
			new transports.File({
				dirname: 'logs',
				filename: 'error.log',
				level: 'error',
				format: format.combine(
					format.splat(),
					format.timestamp(),
					format.printf(({timestamp, level, message}) => {
						return `[${timestamp}] ${level}: ${message}`;
					})
				),
			}),
			new transports.File({
				dirname: 'logs',
				filename: 'combined.log',
				format: format.combine(
					format.splat(),
					format.timestamp(),
					format.printf(({timestamp, level, message}) => {
						return `[${timestamp}] ${level}: ${message}`;
					})
				),
			}),
		],
	});
