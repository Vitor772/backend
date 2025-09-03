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
exports.initUserMonitorQueues = exports.userMonitor = void 0;
const bull_1 = __importDefault(require("bull"));
const Sentry = __importStar(require("@sentry/node"));
const sequelize_1 = require("sequelize");
const lodash_1 = require("lodash");
const logger_1 = __importDefault(require("../utils/logger"));
const database_1 = __importDefault(require("../database"));
const User_1 = __importDefault(require("../models/User"));
const connection = process.env.REDIS_URI || "";
exports.userMonitor = new bull_1.default("UserMonitor", connection);
async function handleLoginStatus(job) {
    const users = await database_1.default.query(`select id from "Users" where "updatedAt" < now() - '5 minutes'::interval and online = true`, { type: sequelize_1.QueryTypes.SELECT });
    for (let item of users) {
        try {
            const user = await User_1.default.findByPk(item.id);
            await user.update({ online: false });
            logger_1.default.info(`Usuario passado para offline: ${item.id}`);
        }
        catch (e) {
            Sentry.captureException(e);
        }
    }
}
async function handleUserConnection(job) {
    try {
        const { id } = job.data;
        if (!(0, lodash_1.isNil)(id) && id !== "null") {
            const user = await User_1.default.findByPk(id);
            if (user) {
                user.online = true;
                await user.save();
            }
        }
    }
    catch (e) {
        Sentry.captureException(e);
    }
}
exports.userMonitor.process("UserConnection", handleUserConnection);
exports.userMonitor.process("VerifyLoginStatus", handleLoginStatus);
async function initUserMonitorQueues() {
    const repeatableJobs = await exports.userMonitor.getRepeatableJobs();
    for (let job of repeatableJobs) {
        await exports.userMonitor.removeRepeatableByKey(job.key);
    }
    exports.userMonitor.add("VerifyLoginStatus", {}, {
        repeat: { cron: "* * * * *", key: "verify-loginstatus" },
        removeOnComplete: { age: 60 * 60, count: 10 },
        removeOnFail: { age: 60 * 60, count: 10 }
    });
    logger_1.default.info("Queue: monitoramento de status de usuário inicializado");
}
exports.initUserMonitorQueues = initUserMonitorQueues;
