"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@temporalio/testing");
const assert_1 = __importDefault(require("assert"));
const mocha_1 = require("mocha");
const _1 = require(".");
const dist_1 = require("../../../../../dist");
(0, mocha_1.describe)('hardcodedPasswordLogin activity', async () => {
    (0, mocha_1.it)('successfully login', async () => {
        const env = new testing_1.MockActivityEnvironment();
        const username = 'Temporal';
        const password = 'temporal';
        const result = await env.run(_1.hardcodedPasswordLogin, username, password);
        assert_1.default.equal(result, 'Hello, Temporal !');
    });
    (0, mocha_1.it)('failed login', async () => {
        const env = new testing_1.MockActivityEnvironment();
        const username = 'Temporal';
        const password = 'bad password';
        try {
            const result = await env.run(_1.hardcodedPasswordLogin, username, password);
        }
        catch (error) {
            const activityResponse = JSON.parse(error.message);
            (0, assert_1.default)(error instanceof dist_1.JobarError);
            assert_1.default.equal(activityResponse.message, 'Unauthorized');
            assert_1.default.equal(activityResponse.statusCode, 401);
            assert_1.default.equal(activityResponse.errorCode, 'unauthorized');
        }
    });
});
//# sourceMappingURL=hardcoded-password-login.spec.js.map