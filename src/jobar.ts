import { NativeConnection, WorkerOptions } from '@temporalio/worker';
import {Express} from 'express';
import { TaskQueue } from './models/taskQueue';
import { Logger } from 'winston';
import { getDefaultLogger } from './utils';

interface JobarOptions {
    app: Express,
    workflowsPath: string;
    temporalAddress: string;
    logger?: Logger;
    logLevel?: string;
    namespace?: string
}

interface JobarConfig {
    activities : WorkerOptions['activities'];
}

export class Jobar {
    app: Express;
    activities: WorkerOptions['activities'];
    workflowsPath: string;
    temporalAddress: string;
    logger: Logger;
    logLevel: string;
    namespace: string;

    constructor({
        app,
        workflowsPath,
        temporalAddress,
        logger,
        logLevel = "debug",
        namespace = "default"
    }: JobarOptions) {
        this.app = app;
        this.temporalAddress = temporalAddress;
        this.workflowsPath = workflowsPath;
        this.logLevel = logLevel;
        this.namespace = namespace;
        this.logger = logger ?? getDefaultLogger(this.logLevel)
    }

    async run({activities}: JobarConfig) {
        this.logger.info(`🚀 Try to connect to temporal on ${this.temporalAddress}...`);
        const connection = await NativeConnection.connect({
            address: this.temporalAddress,
        });
        this.logger.info(`✅ Connected to temporal.`);
        for (const taskQueue of TaskQueue.tasksQueues) {
            taskQueue.run({app: this.app, connection, logger: this.logger, namespace: this.namespace, temporalAddress: this.temporalAddress, workerOptions: {
                taskQueue: taskQueue.name,
                workflowsPath: this.workflowsPath,
                activities,
            }});
        }
    }
}