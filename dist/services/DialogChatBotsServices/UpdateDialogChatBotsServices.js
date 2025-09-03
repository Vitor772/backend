"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DialogChatBots_1 = __importDefault(require("../../models/DialogChatBots"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const UpdateDialogChatBotsServices = async ({ quickAnswerData, quickAnswerId }) => {
    const { awaiting, contactId, chatbotId } = quickAnswerData;
    const quickAnswer = await DialogChatBots_1.default.findOne({
        where: { id: quickAnswerId },
        attributes: ["id", "awaitingt", "contactId", "chatbotId"]
    });
    if (!quickAnswer) {
        throw new AppError_1.default("ERR_NO_DIALOG_CHATBOT_FOUND", 404);
    }
    await quickAnswer.update({
        awaiting,
        contactId,
        chatbotId
    });
    await quickAnswer.reload({
        attributes: ["id", "awaitingt", "contactId", "chatbotId"]
    });
    return quickAnswer;
};
exports.default = UpdateDialogChatBotsServices;
