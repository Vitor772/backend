"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Webhook_1 = require("../../models/Webhook");
const DeleteWebHookService = async (id) => {
    const webhook = await Webhook_1.WebhookModel.findOne({
        where: { id }
    });
    if (!webhook) {
        throw new AppError_1.default("ERR_NO_TICKET_FOUND", 404);
    }
    await webhook.destroy();
    return webhook;
};
exports.default = DeleteWebHookService;
