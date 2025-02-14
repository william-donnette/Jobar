"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jobar_1 = require("jobar");
const workflows_1 = require("../workflows");
// Create your task from your workflow
const exampleTask = new jobar_1.Task(workflows_1.HelloWorld, {
    setWorkflowId: (req) => {
        return 'workflow-hello-world-' + req.body.name;
    },
    isExposed: true,
    method: 'post',
    endpoint: 'helloWorld',
});
// Add the task in a queue, add all the task you want on the queue
const exampleTaskQueue = new jobar_1.TaskQueue('example').addTask(exampleTask);
exports.default = exampleTaskQueue;
//# sourceMappingURL=hello-world.js.map