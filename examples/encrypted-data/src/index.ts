import express from 'express';
import Jobar from 'jobar';
import activities from './activities';
import exampleTaskQueue from './tasks/example';

const app = express();
app.use(express.json());

const jobar = new Jobar({
	app,
	workflowsPath: require.resolve('./workflows'),
	temporalAddress: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233',
});

jobar.addTaskQueue(exampleTaskQueue).run({activities});

app.listen(process.env.JOBAR_PORT, () => console.log(`Server is running on port ${process.env.JOBAR_PORT}`));
