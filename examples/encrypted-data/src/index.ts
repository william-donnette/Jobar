import 'dotenv/config';
import express from 'express';
import Jobar from 'jobar';
import activities from './activities';
import {HOSTNAME, PORT, TEMPORAL_ADDRESS} from './config';
import exampleTaskQueue from './tasks/example';

const app = express();
app.use(express.json());

const onRequestError = ({initialError, response, workflowId}) => {
	response.status(500).json({
		error: {
			name: initialError.message
		}
	})
}

const jobar: Jobar = new Jobar({
	app,
	workflowsPath: require.resolve('./workflows'),
	temporalAddress: TEMPORAL_ADDRESS,
	onRequestError: onRequestError,
	activities
});

jobar.addTaskQueue(exampleTaskQueue).run();

app.listen(PORT, HOSTNAME, () => console.log(`Server is running on ${HOSTNAME}:${PORT}`));
