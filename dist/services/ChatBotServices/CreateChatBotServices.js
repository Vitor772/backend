"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const CreateChatBotServices = async (chatBotData) => {
    const chatBot = await Chatbot_1.default.create(chatBotData);
    return chatBot;
};
exports.default = CreateChatBotServices;
