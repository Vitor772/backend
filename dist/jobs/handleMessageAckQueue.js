"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wbotMessageListener_1 = require("../services/WbotServices/wbotMessageListener");
exports.default = {
    key: `${process.env.DB_NAME}-handleMessageAck`,
    options: {
        priority: 1
    },
    async handle({ data }) {
        try {
            const { msg, chat } = data;
            await (0, wbotMessageListener_1.handleMsgAck)(msg, chat);
        }
        catch (error) {
            console.log("error", error);
        }
    },
};
