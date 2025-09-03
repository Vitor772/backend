"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const DialogChatBots_1 = __importDefault(require("../../models/DialogChatBots"));
const ListDialogChatBotsServices = async () => {
    const chatBot = await DialogChatBots_1.default.findAll({
        where: {
            queueId: {
                [sequelize_1.Op.or]: [null]
            }
        },
        order: [["name", "ASC"]]
    });
    return chatBot;
};
exports.default = ListDialogChatBotsServices;
