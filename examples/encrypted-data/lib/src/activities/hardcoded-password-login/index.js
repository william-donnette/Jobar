"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardcodedPasswordLogin = hardcodedPasswordLogin;
const jobar_1 = require("jobar");
async function hardcodedPasswordLogin(username, password) {
    if (password !== 'temporal') {
        throw new jobar_1.JobarError('Unauthorized', {
            statusCode: 401,
            errorCode: 'unauthorized',
            description: 'Bad credentials.',
        });
    }
    return `Hello, ${username} !`;
}
//# sourceMappingURL=index.js.map