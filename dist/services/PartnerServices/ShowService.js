"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Partner_1 = __importDefault(require("../../models/Partner"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowService = async (id) => {
    const record = await Partner_1.default.findByPk(id);
    if (!record) {
        throw new AppError_1.default("ERR_NO_PARTNER_FOUND", 404);
    }
    return record;
};
exports.default = ShowService;
