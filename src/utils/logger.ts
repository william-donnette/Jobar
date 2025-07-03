import {DefaultLogger} from '@temporalio/worker';
import fs from 'fs';
import path from 'path';
import {createLogger, format, transports} from 'winston';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export const getDefaultLogger = (level: LogLevel) => {
	const logDir = path.resolve('logs');
	if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

	const logger = createLogger({
		level: level.toLowerCase(),
		format: format.combine(
			format.splat(),
			format.timestamp(),
			format.printf(({timestamp, level, message}) => `[${timestamp}] ${level}: ${message}`)
		),
		transports: [
			new transports.Console({
				format: format.combine(
					format.colorize(),
					format.splat(),
					format.timestamp(),
					format.printf(({timestamp, level, message}) => `[${timestamp}] ${level}: ${message}`)
				),
			}),
			new transports.File({
				filename: path.join(logDir, 'error.log'),
				level: 'error',
			}),
			new transports.File({
				filename: path.join(logDir, 'combined.log'),
			}),
		],
	});

	return new DefaultLogger(level, ({level, message}) => {
		logger.log({
			level: level.toLowerCase(),
			message,
		});
	});
};
