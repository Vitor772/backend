"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const User_1 = __importDefault(require("../../models/User"));
const ToggleChangeWidthService = async ({ userId, defaultTicketsManagerWidth }) => {
    const user = await User_1.default.findOne({
        where: { id: userId },
        attributes: ["id", "defaultTicketsManagerWidth"]
    });
    if (!user) {
        throw new AppError_1.default("ERR_NO_USER_FOUND", 404);
    }
    await user.update({
        defaultTicketsManagerWidth: Number(defaultTicketsManagerWidth)
    });
    await user.reload({
        include: ["queues", "whatsapp", "company"]
    });
    return user;
};
exports.default = ToggleChangeWidthService;
