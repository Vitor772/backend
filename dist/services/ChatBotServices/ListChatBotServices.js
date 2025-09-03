"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const ListChatBotService = async () => {
    const chatBot = await Chatbot_1.default.findAll({
        where: {
            queueId: {
                [sequelize_1.Op.or]: [null]
            }
        },
        order: [["id", "ASC"]]
    });
    return chatBot;
};
exports.default = ListChatBotService;
