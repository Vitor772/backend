"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageFlow = void 0;
const GetWhatsappWbot_1 = __importDefault(require("./GetWhatsappWbot"));
const SendMessageFlow = async (whatsapp, messageData, isFlow = false, isRecord = false) => {
    try {
        const wbot = await (0, GetWhatsappWbot_1.default)(whatsapp);
        const chatId = `${messageData.number}@s.whatsapp.net`;
        let message;
        const templateButtons = [
            { index: 1, urlButton: { displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys' } },
            { index: 2, callButton: { displayText: 'Call me!+1 (234) 5678-901' } },
            { index: 3, quickReplyButton: { displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message' } },
        ];
        const body = `\u200e${messageData.body}`;
        message = await wbot.sendMessage(chatId, { text: body });
        return message;
    }
    catch (err) {
        throw new Error(err);
    }
};
exports.SendMessageFlow = SendMessageFlow;
