"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("@whiskeysockets/baileys");
const Sentry = __importStar(require("@sentry/node"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const GetTicketWbot_1 = __importDefault(require("../../helpers/GetTicketWbot"));
const Message_1 = __importDefault(require("../../models/Message"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const lodash_1 = require("lodash");
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const SendWhatsAppMessage = async ({ body, ticket, quotedMsg, msdelay, vCard, isForwarded = false }) => {
    let options = {};
    const wbot = await (0, GetTicketWbot_1.default)(ticket);
    const contactNumber = await Contact_1.default.findByPk(ticket.contactId);
    let number;
    if (contactNumber.remoteJid && contactNumber.remoteJid !== "" && contactNumber.remoteJid.includes("@")) {
        number = contactNumber.remoteJid;
    }
    else {
        number = `${contactNumber.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
    }
    if (quotedMsg) {
        const chatMessages = await Message_1.default.findOne({
            where: {
                id: quotedMsg.id
            }
        });
        if (chatMessages) {
            const msgFound = JSON.parse(chatMessages.dataJson);
            if (msgFound.message.extendedTextMessage !== undefined) {
                options = {
                    quoted: {
                        key: msgFound.key,
                        message: {
                            extendedTextMessage: msgFound.message.extendedTextMessage,
                        }
                    },
                };
            }
            else {
                options = {
                    quoted: {
                        key: msgFound.key,
                        message: {
                            conversation: msgFound.message.conversation,
                        }
                    },
                };
            }
        }
    }
    if (!(0, lodash_1.isNil)(vCard)) {
        const numberContact = vCard.number;
        const firstName = vCard.name.split(' ')[0];
        const lastName = String(vCard.name).replace(vCard.name.split(' ')[0], '');
        const vcard = `BEGIN:VCARD\n`
            + `VERSION:3.0\n`
            + `N:${lastName};${firstName};;;\n`
            + `FN:${vCard.name}\n`
            + `TEL;type=CELL;waid=${numberContact}:+${numberContact}\n`
            + `END:VCARD`;
        try {
            await (0, baileys_1.delay)(msdelay);
            const sentMessage = await wbot.sendMessage(number, {
                contacts: {
                    displayName: `${vCard.name}`,
                    contacts: [{ vcard }]
                }
            });
            await ticket.update({ lastMessage: (0, Mustache_1.default)(vcard, ticket), imported: null });
            return sentMessage;
        }
        catch (err) {
            Sentry.captureException(err);
            console.log(err);
            throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
        }
    }
    ;
    try {
        await (0, baileys_1.delay)(msdelay);
        const sentMessage = await wbot.sendMessage(number, {
            text: (0, Mustache_1.default)(body, ticket),
            contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded ? true : false }
        }, {
            ...options
        });
        await ticket.update({ lastMessage: (0, Mustache_1.default)(body, ticket), imported: null });
        return sentMessage;
    }
    catch (err) {
        console.log(`erro ao enviar mensagem na company ${ticket.companyId} - `, body, ticket, quotedMsg, msdelay, vCard, isForwarded);
        Sentry.captureException(err);
        console.log(err);
        throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
    }
};
exports.default = SendWhatsAppMessage;
