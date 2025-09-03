"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DialogChatBots_1 = __importDefault(require("../../models/DialogChatBots"));
const CreateDialogChatBotsServices = async ({ awaiting, contactId, chatbotId, queueId }) => {
    const quickAnswer = await DialogChatBots_1.default.create({
        awaiting,
        contactId,
        chatbotId,
        queueId
    });
    return quickAnswer;
};
exports.default = CreateDialogChatBotsServices;
