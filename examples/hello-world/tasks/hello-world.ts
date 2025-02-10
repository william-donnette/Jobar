import {Request} from 'express';
import {Task, TaskQueue, getDataConverter} from 'jobar';
import {HelloWorld} from '../workflows';

// Create your task from your workflow
const exampleTask = new Task(HelloWorld, {
	setWorkflowId: (req: Request) => {
		return 'workflow-hello-world-' + req.body.name;
	},
	isExposed: true,
	method: 'post',
	endpoint: 'helloWorld',
});

// Add the task in a queue, add all the task you want on the queue
const exampleTaskQueue = new TaskQueue('example', {
	getDataConverter, // Temporal authorize you to don't show sensitive informations in the dashboard by using an encrypt/decrypt, Jobar give you a default DataConverter using crypto
}).addTask(exampleTask);

export default exampleTaskQueue;
