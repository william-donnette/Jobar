"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@temporalio/testing");
const worker_1 = require("@temporalio/worker");
const assert_1 = __importDefault(require("assert"));
const mocha_1 = require("mocha");
const _1 = require(".");
(0, mocha_1.describe)('HelloWorld workflow with mocks', () => {
    let testEnv;
    (0, mocha_1.before)(async () => {
        testEnv = await testing_1.TestWorkflowEnvironment.createLocal();
    });
    after(async () => {
        await testEnv?.teardown();
    });
    (0, mocha_1.it)('successfully completes the Workflow with a mocked Activity', async () => {
        const { client, nativeConnection } = testEnv;
        const taskQueue = 'test';
        const worker = await worker_1.Worker.create({
            connection: nativeConnection,
            taskQueue,
            workflowsPath: require.resolve('..'),
            activities: {
                sayHello: async () => 'Hello, Temporal !',
            },
        });
        const result = await worker.runUntil(client.workflow.execute(_1.HelloWorld, {
            args: [{ name: 'Temporal' }],
            workflowId: 'test',
            taskQueue,
        }));
        assert_1.default.equal(result, 'Hello, Temporal !');
    }).timeout(20000); // 20 sec
});
//# sourceMappingURL=hello-world-mocks.spec.js.map