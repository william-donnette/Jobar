"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorld = HelloWorld;
const workflow_1 = require("@temporalio/workflow");
const { sayHello } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});
/* istanbul ignore next */
async function HelloWorld(body, headers) {
    /**
     *
     * WARNING !!!
     * You can't add here buisness code that require other libraries
     * Prefer use only buisness activities and track all the workflow on temporal dashboard
     *
     */
    const treatmentResponse = await sayHello(body.name);
    // Add other activities
    return treatmentResponse;
}
//# sourceMappingURL=index.js.map