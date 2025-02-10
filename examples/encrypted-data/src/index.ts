import express from 'express';
import Jobar from 'jobar';
import activities from './activities';
import exampleTaskQueue from './tasks/example';

const app = express();
app.use(express.json());

const jobar = new Jobar({
	app,
	workflowsPath: require.resolve('./src/workflows'),
	temporalAddress: 'localhost:7233',
});

jobar.addTaskQueue(exampleTaskQueue).run({activities});

app.listen(3000, () => console.log('Server is running on port 3000'));
