"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const UserQueue_1 = __importDefault(require("../../models/UserQueue"));
const ListUserQueueServices = async (queueId) => {
    const userQueue = await UserQueue_1.default.findOne({
        where: {
            queueId: {
                [sequelize_1.Op.or]: [queueId]
            }
        },
        order: sequelize_1.Sequelize.literal('random()')
    });
    if (!userQueue) {
        throw new AppError_1.default("ERR_NOT_FOUND_USER_IN_QUEUE", 404);
    }
    return userQueue;
};
exports.default = ListUserQueueServices;
