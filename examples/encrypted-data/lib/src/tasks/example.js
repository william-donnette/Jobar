"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jobar_1 = require("jobar");
const workflows_1 = require("../workflows");
// Create your task from your workflow
const exampleTask = new jobar_1.Task(workflows_1.login, {
    setWorkflowId: (req) => {
        return 'workflow-login-' + req.body.username;
    },
    isExposed: true,
    method: 'post',
    endpoint: 'login',
});
// Add the task in a queue, add all the task you want on the queue
const exampleTaskQueue = new jobar_1.TaskQueue('example', {
    getDataConverter: jobar_1.getDataConverter, // Temporal authorize you to don't show sensitive informations in the dashboard by using an encrypt/decrypt, Jobar give you a default DataConverter using crypto
}).addTask(exampleTask);
exports.default = exampleTaskQueue;
//# sourceMappingURL=example.js.map