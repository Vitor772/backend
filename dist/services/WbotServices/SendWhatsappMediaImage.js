"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("@whiskeysockets/baileys");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const GetTicketWbot_1 = __importDefault(require("../../helpers/GetTicketWbot"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
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
const SendWhatsAppMediaImage = async ({ ticket, url, caption, msdelay }) => {
    const wbot = await (0, GetTicketWbot_1.default)(ticket);
    const contactNumber = await Contact_1.default.findByPk(ticket.contactId);
    let number;
    if (contactNumber.remoteJid && contactNumber.remoteJid !== "" && contactNumber.remoteJid.includes("@")) {
        number = contactNumber.remoteJid;
    }
    else {
        number = `${contactNumber.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
    }
    try {
        wbot.sendPresenceUpdate('available');
        await (0, baileys_1.delay)(msdelay);
        const sentMessage = await wbot.sendMessage(`${number}`, {
            image: url ? { url } : fs_1.default.readFileSync(`${publicFolder}/company${ticket.companyId}/${caption}-${makeid(5)}.png`),
            caption: (0, Mustache_1.default)(`${caption}`, ticket),
            mimetype: 'image/jpeg'
        });
        wbot.sendPresenceUpdate('unavailable');
        return sentMessage;
    }
    catch (err) {
        throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
    }
};
exports.default = SendWhatsAppMediaImage;
