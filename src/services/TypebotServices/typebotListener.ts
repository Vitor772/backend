import axios from "axios";
import Ticket from "../../models/Ticket";
import QueueIntegrations from "../../models/QueueIntegrations";
import { WASocket, delay, proto } from "@whiskeysockets/baileys";
import { getBodyMessage } from "../WbotServices/wbotMessageListener";
import logger from "../../utils/logger";
import { isNil } from "lodash";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import moment from "moment";
import formatBody from "../../helpers/Mustache";

type Session = WASocket & {
    id?: number;
};

interface Request {
    wbot: Session;
    msg: proto.IWebMessageInfo;
    ticket: Ticket;
    typebot: QueueIntegrations;
}

const typebotListener = async ({
    wbot,
    msg,
    ticket,
    typebot
}: Request): Promise<void> => {
    if (msg.key.remoteJid === 'status@broadcast') return;

    const {
        urlN8N: url,
        typebotExpires,
        typebotKeywordFinish,
        typebotKeywordRestart,
        typebotUnknownMessage,
        typebotSlug,
        typebotDelayMessage,
        typebotRestartMessage
    } = typebot;

    const number = msg.key.remoteJid.replace(/\D/g, '');

    let body = getBodyMessage(msg);

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

            const request = await axios.request(config);

            return request.data;

        } catch (err) {
            logger.info("Erro ao criar sessão do typebot: ", err);
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

        if (isNil(ticket.typebotSessionId)) {
            dataStart = await createSession(msg, typebot, number);
            sessionId = dataStart.sessionId;
            status = true;
            await ticket.update({
                typebotSessionId: sessionId,
                typebotStatus: true,
                useIntegration: true,
                integrationId: typebot.id,
                typebotSessionTime: moment().toDate()
            });
            await ticket.reload();
        } else {
            sessionId = ticket.typebotSessionId;
            status = ticket.typebotStatus;
        }

        if (!status) return;

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
                requestContinue = await axios.request(config);
                messages = requestContinue.data?.messages;
            } else {
                messages = dataStart?.messages;
            }

            if (!messages?.length) {
                await wbot.sendMessage(`${number}@c.us`, { text: typebotUnknownMessage });
            } else {
                for (const message of messages) {
                    if (message.type === 'text') {
                        let formattedText = '';
                        let linkPreview = false;

                        for (const richText of message.content.richText) {
                            for (const element of richText.children) {
                                let text = element.text || '';

                                if (element.bold) text = `*${text}*`;
                                if (element.italic) text = `_${text}_`;
                                if (element.underline) text = `~${text}~`;
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
                        await delay(typebotDelayMessage);
                        await wbot.sendPresenceUpdate('paused', msg.key.remoteJid);

                        await wbot.sendMessage(msg.key.remoteJid, { text: formatBody(formattedText, ticket) });
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
            await UpdateTicketService({
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
    } catch (error) {
        logger.info("Error on typebotListener: ", error);
        await ticket.update({
            typebotSessionId: null
        });
        throw error;
    }
};

export default typebotListener;
