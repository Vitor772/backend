"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const dbConfig = require("../../config/database");
const sequelize = new sequelize_typescript_1.Sequelize(dbConfig);
const GetMessageRangeService = async ({ companyId, startDate, lastDate }) => {
    let messages;
    messages = await sequelize.query(`select * from "Messages" m where "companyId" = ${companyId} and "createdAt" between '${startDate} 00:00:00' and '${lastDate} 23:59:59'`, {
        type: sequelize_1.QueryTypes.SELECT
    });
    if (!messages) {
        throw new AppError_1.default("MESSAGES_NOT_FIND");
    }
    return messages;
};
exports.default = GetMessageRangeService;
