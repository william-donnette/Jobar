import {Request} from 'express';
import {Task, TaskQueue, getDataConverter} from 'jobar';
import {login} from '@workflows';

// Create your task from your workflow
const exampleTask = new Task(login, {
	setWorkflowId: (req: Request) => {
		return 'workflow-login-' + req.body.username;
	},
	isExposed: true,
	method: 'post',
	endpoint: '/tasks/login',
});

// Add the task in a queue, add all the task you want on the queue
const exampleTaskQueue = new TaskQueue('example', {
	getDataConverter, // Temporal authorize you to don't show sensitive informations in the dashboard by using an encrypt/decrypt, Jobar give you a default DataConverter using crypto
}).addTask(exampleTask);

export default exampleTaskQueue;
