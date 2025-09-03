"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const ShowChatBotByChatbotIdServices = async (chatbotId) => {
    const queue = await Chatbot_1.default.findOne({
        where: { chatbotId },
        include: [
            {
                model: Chatbot_1.default,
                as: "mainChatbot",
                attributes: ["id", "name", "greetingMessage"],
                order: [[{ model: Chatbot_1.default, as: "mainChatbot" }, "id", "ASC"]]
            },
            {
                model: Chatbot_1.default,
                as: "options",
                order: [[{ model: Chatbot_1.default, as: "options" }, "id", "ASC"]],
                attributes: ["id", "name", "greetingMessage"]
            }
        ],
        order: [["id", "asc"]]
    });
    if (!queue) {
        throw new AppError_1.default("ERR_CHATBOT_NOT_FOUND_SERVICE", 404);
    }
    return queue;
};
exports.default = ShowChatBotByChatbotIdServices;
