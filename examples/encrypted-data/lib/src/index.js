"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobar_1 = __importDefault(require("jobar"));
const activities_1 = __importDefault(require("./activities"));
const example_1 = __importDefault(require("./tasks/example"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const jobar = new jobar_1.default({
    app,
    workflowsPath: require.resolve('./workflows'),
    temporalAddress: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233',
});
jobar.addTaskQueue(example_1.default).run({ activities: activities_1.default });
app.listen(process.env.JOBAR_PORT, () => console.log(`Server is running on port ${process.env.JOBAR_PORT}`));
//# sourceMappingURL=index.js.map