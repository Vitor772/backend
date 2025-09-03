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
const Message_1 = __importDefault(require("../../models/Message"));
const wbot_1 = require("../../libs/wbot");
const SendWhatsAppMessage = async ({ body, whatsappId, contact, quotedMsg, msdelay }) => {
    let options = {};
    const wbot = await (0, wbot_1.getWbot)(whatsappId);
    const number = `${contact.number}@${contact.isGroup ? "g.us" : "s.whatsapp.net"}`;
    if (quotedMsg) {
        const chatMessages = await Message_1.default.findOne({
            where: {
                id: quotedMsg.id
            }
        });
        if (chatMessages) {
            const msgFound = JSON.parse(chatMessages.dataJson);
            options = {
                quoted: {
                    key: msgFound.key,
                    message: {
                        extendedTextMessage: msgFound.message.extendedTextMessage
                    }
                }
            };
        }
    }
    try {
        await (0, baileys_1.delay)(msdelay);
        const sentMessage = await wbot.sendMessage(number, {
            text: body
        }, {
            ...options
        });
        return sentMessage;
    }
    catch (err) {
        Sentry.captureException(err);
        console.log(err);
        throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
    }
};
exports.default = SendWhatsAppMessage;
