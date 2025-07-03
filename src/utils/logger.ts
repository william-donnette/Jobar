import {DefaultLogger} from '@temporalio/worker';
import {createLogger, format, Logger, transports} from 'winston';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
/* istanbul ignore next */
export const getDefaultLogger = (level: LogLevel) => {
	return new DefaultLogger(level, ({level, message}) => {
		const lvl = level as LogLevel;
		createLogger({
			level: lvl,
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
		})[lvl.toLowerCase() as keyof Logger]?.(message);
	});
};
