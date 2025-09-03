"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Partner_1 = __importDefault(require("../../models/Partner"));
const UpdateService = async (data) => {
    const { id } = data;
    const record = await Partner_1.default.findByPk(id);
    if (!record) {
        throw new AppError_1.default("ERR_NO_PARTNER_FOUND", 404);
    }
    await record.update(data);
    return record;
};
exports.default = UpdateService;
