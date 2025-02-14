"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@temporalio/testing");
const assert_1 = __importDefault(require("assert"));
const mocha_1 = require("mocha");
const _1 = require(".");
(0, mocha_1.describe)('sayHello activity', async () => {
    (0, mocha_1.it)('successfully sayHello', async () => {
        const env = new testing_1.MockActivityEnvironment();
        const name = 'Temporal';
        const result = await env.run(_1.sayHello, name);
        assert_1.default.equal(result, 'Hello, Temporal !');
    });
});
//# sourceMappingURL=say-hello.spec.js.map