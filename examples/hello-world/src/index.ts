import 'dotenv/config';
import express from 'express';
import Jobar from 'jobar';
import activities from './activities';
import {HOSTNAME, PORT, TEMPORAL_ADDRESS} from './config';
import exampleTaskQueue from './tasks/hello-world';

const app = express();
app.use(express.json());

const jobar: Jobar = new Jobar({
	app,
	workflowsPath: require.resolve('./workflows'),
	temporalAddress: TEMPORAL_ADDRESS,
});

jobar.addTaskQueue(exampleTaskQueue).run({activities});

app.listen(PORT, HOSTNAME, () => console.log(`Server is running on ${HOSTNAME}:${PORT}`));
