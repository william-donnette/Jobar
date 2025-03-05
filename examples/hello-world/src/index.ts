import activities from '@activities';
import {HOSTNAME, PORT, TEMPORAL_ADDRESS} from '@src/config';
import exampleTaskQueue from '@tasks/hello-world';
import 'dotenv/config';
import express from 'express';
import Jobar from 'jobar';

const app = express();
app.use(express.json());

const jobar: Jobar = new Jobar({
	app,
	workflowsPath: require.resolve('./workflows'),
	temporalAddress: TEMPORAL_ADDRESS,
	activities,
	onRequestError: ({workflowId}) => {
		return `❌ Workflow ${workflowId} failed !`;
	},
});

jobar.addTaskQueue(exampleTaskQueue).run();

app.listen(PORT, HOSTNAME, () => console.log(`Server is running on ${HOSTNAME}:${PORT}`));
