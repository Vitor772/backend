"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bull_1 = __importDefault(require("bull"));
const redis_1 = require("../config/redis");
const configLoaderService_1 = __importDefault(require("../services/ConfigLoaderService/configLoaderService"));
const jobs = __importStar(require("../jobs"));
const logger_1 = __importDefault(require("../utils/logger"));
const config = (0, configLoaderService_1.default)(); // Carregue as configurações
const queueOptions = {
    defaultJobOptions: {
        attempts: config.webhook.attempts,
        backoff: {
            type: config.webhook.backoff.type,
            delay: config.webhook.backoff.delay,
        },
        removeOnFail: false,
        removeOnComplete: true,
    },
    limiter: {
        max: config.webhook.limiter.max,
        duration: config.webhook.limiter.duration,
    },
};
const queues = Object.values(jobs).reduce((acc, job) => {
    acc.push({
        bull: new bull_1.default(job.key, redis_1.REDIS_URI_MSG_CONN, queueOptions),
        name: job.key,
        handle: job.handle,
    });
    return acc;
}, []);
exports.default = {
    queues,
    add(name, data, params = {}) {
        const queue = this.queues.find(queue => queue.name === name);
        if (!queue) {
            throw new Error(`Queue ${name} not found`);
        }
        return queue.bull.add(data, { ...params, removeOnComplete: true });
    },
    process() {
        return this.queues.forEach(queue => {
            queue.bull.process(queue.handle);
            queue.bull.on('failed', (job, err) => {
                logger_1.default.error(`Job failed: ${queue.key} ${job.data}`);
                logger_1.default.error(err);
            });
        });
    }
};
