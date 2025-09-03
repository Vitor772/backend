"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const DialogChatBots_1 = __importDefault(require("../../models/DialogChatBots"));
const ShowDialogChatBotsServices = async (contactId) => {
    const dialog = await DialogChatBots_1.default.findOne({
        where: {
            contactId
        },
        include: [
            {
                model: Chatbot_1.default,
                as: "chatbots",
                order: [[{ model: Chatbot_1.default, as: "chatbots" }, "id", "ASC"]]
            }
        ]
    });
    return dialog;
};
exports.default = ShowDialogChatBotsServices;
