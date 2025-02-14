"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const workflow_1 = require("@temporalio/workflow");
const { hardcodedPasswordLogin } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 minute',
    retry: {
        maximumAttempts: 3,
    },
});
/* istanbul ignore next */
async function login(body, headers) {
    /**
     *
     * WARNING !!!
     * You can't add here buisness code that require other libraries
     * Prefer use only buisness activities and track all the workflow on temporal dashboard
     *
     */
    try {
        const treatmentResponse = await hardcodedPasswordLogin(body.username, body.password);
        return treatmentResponse;
    }
    catch (e) {
        console.error(e);
        throw e;
    }
    // Add other activities
}
//# sourceMappingURL=index.js.map