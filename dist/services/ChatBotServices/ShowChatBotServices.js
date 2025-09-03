"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const User_1 = __importDefault(require("../../models/User"));
const ShowChatBotServices = async (id) => {
    const queue = await Chatbot_1.default.findOne({
        where: {
            id
        },
        order: [
            [{ model: Chatbot_1.default, as: "mainChatbot" }, "id", "ASC"],
            [{ model: Chatbot_1.default, as: "options" }, "id", "ASC"],
            ["id", "asc"]
        ],
        include: [
            {
                model: Chatbot_1.default,
                as: "mainChatbot",
                include: [
                    {
                        model: User_1.default,
                        as: "user"
                    },
                ]
            },
            {
                model: Chatbot_1.default,
                as: "options",
                include: [
                    {
                        model: User_1.default,
                        as: "user"
                    },
                ]
            },
            {
                model: User_1.default,
                as: "user"
            },
        ]
    });
    if (!queue) {
        throw new AppError_1.default("Chatbot not found", 404);
    }
    return queue;
};
exports.default = ShowChatBotServices;
