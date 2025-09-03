"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const UpdateChatBotServices = async (chatBotId, chatbotData) => {
    const { options } = chatbotData;
    const chatbot = await Chatbot_1.default.findOne({
        where: { id: chatBotId },
        include: ["options"],
        order: [["id", "asc"]]
    });
    if (!chatbot) {
        throw new AppError_1.default("ERR_NO_CHATBOT_FOUND", 404);
    }
    if (options) {
        await Promise.all(options.map(async (bot) => {
            await Chatbot_1.default.upsert({ ...bot, chatbotId: chatbot.id });
        }));
        await Promise.all(chatbot.options.map(async (oldBot) => {
            const stillExists = options.findIndex(bot => bot.id === oldBot.id);
            if (stillExists === -1) {
                await Chatbot_1.default.destroy({ where: { id: oldBot.id } });
            }
        }));
    }
    await chatbot.update(chatbotData);
    await chatbot.reload({
        include: [
            {
                model: Chatbot_1.default,
                as: "mainChatbot",
                attributes: ["id", "name", "greetingMessage", "queueType", "optIntegrationId", "optQueueId", "optUserId", "optFileId"],
                order: [[{ model: Chatbot_1.default, as: "mainChatbot" }, "id", "ASC"]]
            },
            {
                model: Chatbot_1.default,
                as: "options",
                order: [[{ model: Chatbot_1.default, as: "options" }, "id", "ASC"]],
                attributes: ["id", "name", "greetingMessage", "queueType", "optIntegrationId", "optQueueId", "optUserId", "optFileId"]
            }
        ],
        order: [["id", "asc"]]
    });
    return chatbot;
};
exports.default = UpdateChatBotServices;
