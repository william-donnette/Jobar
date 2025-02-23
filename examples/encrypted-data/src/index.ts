import activities from '@activities';
import exampleTaskQueue from '@tasks/example';
import 'dotenv/config';
import express from 'express';
import Jobar from 'jobar';
import {HOSTNAME, PORT, TEMPORAL_ADDRESS} from './config';

const app = express();
app.use(express.json());

const jobar: Jobar = new Jobar({
	app,
	workflowsPath: require.resolve('./workflows'),
	temporalAddress: TEMPORAL_ADDRESS,
	activities,
	onRequestError: ({workflowId, initialError, response}) => {
		console.log(`❌ Workflow ${workflowId} failed !`);
		// Here you can manage your errors
		if (initialError.message === 'Bad Credentials') {
			response.status(403).json({
				error: 'Unauthorized',
				description: 'Bad Credentials',
			});
		} else {
			response.status(500).json({
				error: 'Internal Server Error',
				description: initialError.message,
			});
		}
	},
});

jobar.addTaskQueue(exampleTaskQueue).run();

app.listen(PORT, HOSTNAME, () => console.log(`Server is running on ${HOSTNAME}:${PORT}`));
