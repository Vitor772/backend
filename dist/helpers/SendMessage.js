"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessage = void 0;
const GetWhatsappWbot_1 = __importDefault(require("./GetWhatsappWbot"));
const fs_1 = __importDefault(require("fs"));
const Mustache_1 = __importDefault(require("./Mustache"));
const SendWhatsAppMedia_1 = require("../services/WbotServices/SendWhatsAppMedia");
const SendMessage = async (whatsapp, messageData, isGroup = false) => {
    try {
        const wbot = await (0, GetWhatsappWbot_1.default)(whatsapp);
        const chatId = `${messageData.number}@${!!isGroup ? 'g.us' : 's.whatsapp.net'}`;
        const companyId = messageData?.companyId ? messageData.companyId.toString() : null;
        let message;
        if (messageData.mediaPath) {
            const options = await (0, SendWhatsAppMedia_1.getMessageOptions)(messageData.mediaName, messageData.mediaPath, companyId, messageData.body);
            if (options) {
                const body = fs_1.default.readFileSync(messageData.mediaPath);
                message = await wbot.sendMessage(chatId, {
                    ...options
                });
            }
        }
        else {
            const body = (0, Mustache_1.default)(`${messageData.body}`);
            message = await wbot.sendMessage(chatId, { text: body });
        }
        return message;
    }
    catch (err) {
        throw new Error(err);
    }
};
exports.SendMessage = SendMessage;
