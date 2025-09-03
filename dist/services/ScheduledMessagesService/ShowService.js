"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ScheduledMessages_1 = __importDefault(require("../../models/ScheduledMessages"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ScheduleService = async (id) => {
    const schedule = await ScheduledMessages_1.default.findByPk(id);
    if (!schedule) {
        throw new AppError_1.default("ERR_NO_SCHEDULE_FOUND", 404);
    }
    return schedule;
};
exports.default = ScheduleService;
