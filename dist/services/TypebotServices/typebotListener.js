"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const baileys_1 = require("@whiskeysockets/baileys");
const wbotMessageListener_1 = require("../WbotServices/wbotMessageListener");
const logger_1 = __importDefault(require("../../utils/logger"));
const lodash_1 = require("lodash");
const UpdateTicketService_1 = __importDefault(require("../TicketServices/UpdateTicketService"));
const moment_1 = __importDefault(require("moment"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const typebotListener = async ({ wbot, msg, ticket, typebot }) => {
    if (msg.key.remoteJid === 'status@broadcast')
        return;
    const { urlN8N: url, typebotExpires, typebotKeywordFinish, typebotKeywordRestart, typebotUnknownMessage, typebotSlug, typebotDelayMessage, typebotRestartMessage } = typebot;
    const number = msg.key.remoteJid.replace(/\D/g, '');
    let body = (0, wbotMessageListener_1.getBodyMessage)(msg);
    async function createSession(msg, typebot, number) {
        try {
            const reqData = JSON.stringify({
                "isStreamEnabled": true,
                "message": "string",
                "resultId": "string",
                "isOnlyRegistering": false,
                "prefilledVariables": {
                    "number": number,
                    "pushName": msg.pushName || "",
                    "remoteJid": ticket?.contact?.remoteJid
                },
            });
            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${url}/api/v1/typebots/${typebotSlug}/startChat`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                data: reqData
            };
            const request = await axios_1.default.request(config);
            return request.data;
        }
        catch (err) {
            logger_1.default.info("Erro ao criar sessão do typebot: ", err);
            throw err;
        }
    }
    let sessionId;
    let dataStart;
    let status = false;
    try {
        let now = new Date();
        now.setMinutes(now.getMinutes() - Number(typebotExpires));
        if (typebotExpires > 0 && now > ticket.typebotSessionTime) {
            await ticket.update({
                typebotSessionId: null,
                typebotSessionTime: null,
                isBot: true
            });
            await ticket.reload();
        }
        if ((0, lodash_1.isNil)(ticket.typebotSessionId)) {
            dataStart = await createSession(msg, typebot, number);
            sessionId = dataStart.sessionId;
            status = true;
            await ticket.update({
                typebotSessionId: sessionId,
                typebotStatus: true,
                useIntegration: true,
                integrationId: typebot.id,
                typebotSessionTime: (0, moment_1.default)().toDate()
            });
            await ticket.reload();
        }
        else {
            sessionId = ticket.typebotSessionId;
            status = ticket.typebotStatus;
        }
        if (!status)
            return;
        if (body.toLowerCase().trim() !== typebotKeywordFinish.toLowerCase().trim() &&
            body.toLowerCase().trim() !== typebotKeywordRestart.toLowerCase().trim()) {
            let requestContinue;
            let messages;
            if (!dataStart?.messages?.length) {
                const reqData = JSON.stringify({
                    "message": body
                });
                const config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${url}/api/v1/sessions/${sessionId}/continueChat`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    data: reqData
                };
                requestContinue = await axios_1.default.request(config);
                messages = requestContinue.data?.messages;
            }
            else {
                messages = dataStart?.messages;
            }
            if (!messages?.length) {
                await wbot.sendMessage(`${number}@c.us`, { text: typebotUnknownMessage });
            }
            else {
                for (const message of messages) {
                    if (message.type === 'text') {
                        let formattedText = '';
                        let linkPreview = false;
                        for (const richText of message.content.richText) {
                            for (const element of richText.children) {
                                let text = element.text || '';
                                if (element.bold)
                                    text = `*${text}*`;
                                if (element.italic)
                                    text = `_${text}_`;
                                if (element.underline)
                                    text = `~${text}~`;
                                if (element.url) {
                                    const linkText = element.children[0]?.text || '';
                                    text = `[${linkText}](${element.url})`;
                                    linkPreview = true;
                                }
                                formattedText += text;
                            }
                            formattedText += '\n';
                        }
                        formattedText = formattedText.replace('**', '').replace(/\n$/, '');
                        if (formattedText === "Invalid message. Please, try again.") {
                            formattedText = typebotUnknownMessage;
                        }
                        await wbot.presenceSubscribe(msg.key.remoteJid);
                        await wbot.sendPresenceUpdate('composing', msg.key.remoteJid);
                        await (0, baileys_1.delay)(typebotDelayMessage);
                        await wbot.sendPresenceUpdate('paused', msg.key.remoteJid);
                        await wbot.sendMessage(msg.key.remoteJid, { text: (0, Mustache_1.default)(formattedText, ticket) });
                    }
                    if (message.type === 'audio') {
                        const media = {
                            audio: {
                                url: message.content.url
                            },
                            mimetype: 'audio/mp4',
                            ptt: true
                        };
                        await wbot.sendMessage(msg.key.remoteJid, media);
                    }
                    if (message.type === 'image') {
                        const media = {
                            image: {
                                url: message.content.url
                            }
                        };
                        await wbot.sendMessage(msg.key.remoteJid, media);
                    }
                    if (message.type === 'video') {
                        const media = {
                            video: {
                                url: message.content.url
                            }
                        };
                        await wbot.sendMessage(msg.key.remoteJid, media);
                    }
                }
            }
        }
        if (body.toLowerCase().trim() === typebotKeywordRestart.toLowerCase().trim()) {
            await ticket.update({
                isBot: true,
                typebotSessionId: null
            });
            await ticket.reload();
            await wbot.sendMessage(`${number}@c.us`, { text: typebotRestartMessage });
        }
        if (body.toLowerCase().trim() === typebotKeywordFinish.toLowerCase().trim()) {
            await (0, UpdateTicketService_1.default)({
                ticketData: {
                    status: "closed",
                    useIntegration: false,
                    integrationId: null,
                    sendFarewellMessage: true
                },
                ticketId: ticket.id,
                companyId: ticket.companyId
            });
            return;
        }
    }
    catch (error) {
        logger_1.default.info("Error on typebotListener: ", error);
        await ticket.update({
            typebotSessionId: null
        });
        throw error;
    }
};
exports.default = typebotListener;
