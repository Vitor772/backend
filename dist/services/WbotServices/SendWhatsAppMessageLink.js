"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("@whiskeysockets/baileys");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const wbot_1 = require("../../libs/wbot");
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
const SendWhatsAppMessageLink = async ({ whatsappId, contact, url, caption, msdelay }) => {
    const wbot = await (0, wbot_1.getWbot)(whatsappId);
    const number = `${contact.number}@${contact.isGroup ? "g.us" : "s.whatsapp.net"}`;
    const name = caption.replace('/', '-');
    try {
        await (0, baileys_1.delay)(msdelay);
        const sentMessage = await wbot.sendMessage(`${number}`, {
            document: url ? { url } : fs_1.default.readFileSync(`${publicFolder}/company${contact.companyId}/${name}-${makeid(5)}.pdf`),
            fileName: name,
            mimetype: 'application/pdf'
        });
        return sentMessage;
    }
    catch (err) {
        throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
    }
};
exports.default = SendWhatsAppMessageLink;
