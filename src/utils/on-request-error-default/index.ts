import {WorkflowError} from '@temporalio/workflow';
import {Request, Response} from 'express';
import {JobarError, TaskConfig} from '../../models';
import {findLastError} from '../find-jobar-error-cause';

export type RequestErrorFunction = (
	workflowId: string,
	context: {workflowError: WorkflowError; request: Request; response: Response; taskConfig: TaskConfig}
) => void;

/* istanbul ignore next */
export const onRequestErrorDefault: RequestErrorFunction = (workflowId, {workflowError, request, response, taskConfig}) => {
	const {logger, defaultStatusCodeError} = taskConfig;
	const error = findLastError(workflowError);
	const defaultError = new JobarError('No Message Available');
	const parsedMessage = JSON.parse(error.message);
	if (!parsedMessage.isJobarError) {
		logger.warn('⚠️ Prefer to use JobarError in your activities');
	}
	const jobarError = error as JobarError;
	logger.error(`❌ WORKFLOW ${workflowId} failed : ${jobarError?.message}`);
	response.status(jobarError?.options?.statusCode ?? defaultStatusCodeError).json({
		error: jobarError?.options?.error ?? defaultError.options.error,
		message: jobarError?.message ?? defaultError.message,
		details: jobarError?.options?.details ?? defaultError.options.details,
	});
};
