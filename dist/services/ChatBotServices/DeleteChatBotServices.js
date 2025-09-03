"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ShowChatBotServices_1 = __importDefault(require("./ShowChatBotServices"));
const DeleteChatBotServices = async (chatbotId) => {
    const chatbot = await (0, ShowChatBotServices_1.default)(chatbotId);
    await chatbot.destroy();
};
exports.default = DeleteChatBotServices;
