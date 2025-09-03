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
exports.handleMsgAck = exports.getTypeMessage = exports.isValidMsg = exports.handleMessage = exports.wbotMessageListener = exports.handleMessageIntegration = exports.transferQueue = exports.keepOnlySpecifiedChars = exports.convertTextToSpeechAndSaveToFile = exports.handleRating = exports.verifyRating = exports.verifyMessage = exports.verifyMediaMessage = exports.getQuotedMessageId = exports.getQuotedMessage = exports.getBodyMessage = void 0;
const path_1 = __importStar(require("path"));
const util_1 = require("util");
const fs_1 = require("fs");
const fs_2 = __importDefault(require("fs"));
const Sentry = __importStar(require("@sentry/node"));
const lodash_1 = require("lodash");
const redis_1 = require("../../config/redis");
const baileys_1 = require("@whiskeysockets/baileys");
const Contact_1 = __importDefault(require("../../models/Contact"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Message_1 = __importDefault(require("../../models/Message"));
const async_mutex_1 = require("async-mutex");
const socket_1 = require("../../libs/socket");
const CreateMessageService_1 = __importDefault(require("../MessageServices/CreateMessageService"));
const logger_1 = __importDefault(require("../../utils/logger"));
const CreateOrUpdateContactService_1 = __importDefault(require("../ContactServices/CreateOrUpdateContactService"));
const FindOrCreateTicketService_1 = __importDefault(require("../TicketServices/FindOrCreateTicketService"));
const ShowWhatsAppService_1 = __importDefault(require("../WhatsappService/ShowWhatsAppService"));
const Debounce_1 = require("../../helpers/Debounce");
const UpdateTicketService_1 = __importDefault(require("../TicketServices/UpdateTicketService"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const UserRating_1 = __importDefault(require("../../models/UserRating"));
const SendWhatsAppMessage_1 = __importDefault(require("./SendWhatsAppMessage"));
const sendFacebookMessage_1 = __importDefault(require("../FacebookServices/sendFacebookMessage"));
const moment_1 = __importDefault(require("moment"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const FindOrCreateATicketTrakingService_1 = __importDefault(require("../TicketServices/FindOrCreateATicketTrakingService"));
const VerifyCurrentSchedule_1 = __importDefault(require("../CompanyService/VerifyCurrentSchedule"));
const Campaign_1 = __importDefault(require("../../models/Campaign"));
const CampaignShipping_1 = __importDefault(require("../../models/CampaignShipping"));
const sequelize_1 = require("sequelize");
const queues_1 = require("../../queues");
const User_1 = __importDefault(require("../../models/User"));
const ChatBotListener_1 = require("./ChatBotListener");
const MarkDeleteWhatsAppMessage_1 = __importDefault(require("./MarkDeleteWhatsAppMessage"));
const ListUserQueueServices_1 = __importDefault(require("../UserQueueServices/ListUserQueueServices"));
const cache_1 = __importDefault(require("../../libs/cache"));
const SendWhatsAppMedia_1 = __importStar(require("./SendWhatsAppMedia"));
const ShowQueueIntegrationService_1 = __importDefault(require("../QueueIntegrationServices/ShowQueueIntegrationService"));
const CreateSessionDialogflow_1 = require("../QueueIntegrationServices/CreateSessionDialogflow");
const QueryDialogflow_1 = require("../QueueIntegrationServices/QueryDialogflow");
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const CreateLogTicketService_1 = __importDefault(require("../TicketServices/CreateLogTicketService"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ShowService_1 = __importDefault(require("../FileServices/ShowService"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const microsoft_cognitiveservices_speech_sdk_1 = require("microsoft-cognitiveservices-speech-sdk");
const typebotListener_1 = __importDefault(require("../TypebotServices/typebotListener"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const queue_1 = __importDefault(require("../../libs/queue"));
const wbot_1 = require("../../libs/wbot");
const CheckSettings_1 = require("../../helpers/CheckSettings");
const FlowBuilder_1 = require("../../models/FlowBuilder");
const ActionsWebhookService_1 = require("../WebhookService/ActionsWebhookService");
const Webhook_1 = require("../../models/Webhook");
const date_fns_1 = require("date-fns");
const FlowCampaign_1 = require("../../models/FlowCampaign");
const OpenAiService_1 = require("../IntegrationsServices/OpenAiService");
const os = require("os");
const request = require("request");
let i = 0;
setInterval(() => {
    i = 0;
}, 5000);
const sessionsOpenAi = [];
const writeFileAsync = (0, util_1.promisify)(fs_1.writeFile);
function removeFile(directory) {
    fs_2.default.unlink(directory, error => {
        if (error)
            throw error;
    });
}
const getTimestampMessage = (msgTimestamp) => {
    return msgTimestamp * 1;
};
const multVecardGet = function (param) {
    let output = " ";
    let name = param
        .split("\n")[2]
        .replace(";;;", "\n")
        .replace("N:", "")
        .replace(";", "")
        .replace(";", " ")
        .replace(";;", " ")
        .replace("\n", "");
    let inicio = param.split("\n")[4].indexOf("=");
    let fim = param.split("\n")[4].indexOf(":");
    let contact = param
        .split("\n")[4]
        .substring(inicio + 1, fim)
        .replace(";", "");
    let contactSemWhats = param.split("\n")[4].replace("item1.TEL:", "");
    //console.log(contact);
    if (contact != "item1.TEL") {
        output = output + name + ": 📞" + contact + "" + "\n";
    }
    else
        output = output + name + ": 📞" + contactSemWhats + "" + "\n";
    return output;
};
const contactsArrayMessageGet = (msg) => {
    let contactsArray = msg.message?.contactsArrayMessage?.contacts;
    let vcardMulti = contactsArray.map(function (item, indice) {
        return item.vcard;
    });
    let bodymessage = ``;
    vcardMulti.forEach(function (vcard, indice) {
        bodymessage += vcard + "\n\n" + "";
    });
    let contacts = bodymessage.split("BEGIN:");
    contacts.shift();
    let finalContacts = "";
    for (let contact of contacts) {
        finalContacts = finalContacts + multVecardGet(contact);
    }
    return finalContacts;
};
const getTypeMessage = (msg) => {
    const msgType = (0, baileys_1.getContentType)(msg.message);
    if (msg.message?.extendedTextMessage && msg.message?.extendedTextMessage?.contextInfo && msg.message?.extendedTextMessage?.contextInfo?.externalAdReply) {
        return 'adMetaPreview'; // Adicionado para tratar mensagens de anúncios;
    }
    if (msg.message?.viewOnceMessageV2) {
        return "viewOnceMessageV2";
    }
    return msgType;
};
exports.getTypeMessage = getTypeMessage;
const getAd = (msg) => {
    if (msg.key.fromMe &&
        msg.message?.listResponseMessage?.contextInfo?.externalAdReply) {
        let bodyMessage = `*${msg.message?.listResponseMessage?.contextInfo?.externalAdReply?.title}*`;
        bodyMessage += `\n\n${msg.message?.listResponseMessage?.contextInfo?.externalAdReply?.body}`;
        return bodyMessage;
    }
};
const getBodyButton = (msg) => {
    try {
        if (msg?.messageType === "buttonsMessage" ||
            msg?.message?.buttonsMessage?.contentText) {
            let bodyMessage = `[BUTTON]\n\n*${msg?.message?.buttonsMessage?.contentText}*\n\n`;
            // eslint-disable-next-line no-restricted-syntax
            for (const button of msg.message?.buttonsMessage?.buttons) {
                bodyMessage += `*${button.buttonId}* - ${button.buttonText.displayText}\n`;
            }
            return bodyMessage;
        }
        if (msg?.messageType === "viewOnceMessage" || msg?.message?.viewOnceMessage?.message?.interactiveMessage) {
            let bodyMessage = '';
            const buttons = msg?.message?.viewOnceMessage?.message?.interactiveMessage?.nativeFlowMessage?.buttons;
            const bodyTextWithPix = buttons?.[0]?.name === 'review_and_pay';
            const bodyTextWithButtons = msg?.message?.viewOnceMessage?.message?.interactiveMessage?.body?.text;
            if (bodyTextWithPix) {
                bodyMessage += `[PIX]`;
            }
            else if (bodyTextWithButtons) {
                bodyMessage += `[BOTOES]`;
            }
            return bodyMessage;
        }
        if (msg?.messageType === "interactiveMessage" || msg?.message?.interactiveMessage) {
            let bodyMessage = '';
            console.log('mensagem enviada pelo cel', msg);
            // Verifica se há botões na mensagem
            const buttons = msg?.message?.interactiveMessage?.nativeFlowMessage?.buttons;
            console.log("Buttons:", buttons);
            // Verifica se buttons é um array e se contém o botão 'reviewand_pay'
            const bodyTextWithPix = Array.isArray(buttons) && buttons.some(button => button.name = 'review_and_pay');
            if (bodyTextWithPix) {
                bodyMessage += `[PIX]`;
                console.log("Mensagem de PIX detectada, adicionando [PIX] ao bodyMessage.");
            }
            else {
                console.log("Nenhuma mensagem de PIX encontrada.");
            }
            // Log do bodyMessage final antes do retorno
            console.log("bodyMessage final:", bodyMessage);
            // Retornar bodyMessage se não estiver vazio
            return bodyMessage || null; // Verifique se este ponto é alcançado
        }
        if (msg?.messageType === "viewOnceMessage" || msg?.message?.viewOnceMessage?.message?.interactiveMessage) {
            let bodyMessage = '';
            // Verifica se é uma mensagem de PIX (PIX)
            const bodyTextWithPix = msg?.message?.viewOnceMessage?.message?.interactiveMessage?.header?.title;
            // Verifica se é uma mensagem com botões (BOTOES)
            const bodyTextWithButtons = msg?.message?.viewOnceMessage?.message?.interactiveMessage?.body?.text;
            if (bodyTextWithPix) {
                bodyMessage += `[PIX]`;
            }
            else if (bodyTextWithButtons) {
                bodyMessage += `[BOTOES]`;
            }
            return bodyMessage;
        }
        if (msg?.messageType === "listMessage" || msg?.message?.listMessage?.description) {
            let bodyMessage = `[LIST]\n\n`;
            bodyMessage += msg?.message?.listMessage?.title ? `*${msg?.message?.listMessage?.title}**\n` : 'sem titulo\n';
            bodyMessage += msg?.message?.listMessage?.description ? `*${msg?.message?.listMessage?.description}*\n\n` : 'sem descrição\n\n';
            bodyMessage += msg?.message?.listMessage?.footerText ? `${msg?.message?.listMessage?.footerText}\n\n` : '\n\n';
            const sections = msg?.message?.listMessage?.sections;
            if (sections && sections.length > 0) {
                for (const section of sections) {
                    bodyMessage += section?.title ? `*${section.title}*\n` : 'Sem titulo';
                    const rows = section?.rows;
                    if (rows && rows.length > 0) {
                        for (const row of rows) {
                            const rowTitle = row?.title || '';
                            const rowDescription = row?.description || 'Sem descrição';
                            const rowId = row?.rowId || '';
                            bodyMessage += `${rowTitle} - ${rowDescription} - ${rowId}\n`;
                        }
                    }
                    bodyMessage += `\n`;
                }
            }
            return bodyMessage;
        }
    }
    catch (error) {
        logger_1.default.error(error);
    }
};
const getBodyPIX = (msg) => {
    try {
        // Verifica se é uma mensagem interativa
        if (msg?.messageType === "interactiveMessage" || msg?.message?.interactiveMessage) {
            let bodyMessage = '[PIX]'; // Inicializa bodyMessage com [PIX]
            console.log('mensagem enviada pelo cel', msg);
            // Verifica se há botões na mensagem
            const buttons = msg?.message?.interactiveMessage?.nativeFlowMessage?.buttons;
            console.log("Buttons:", buttons);
            // Se buttons existe e contém o botão 'review_and_pay'
            const bodyTextWithPix = Array.isArray(buttons) && buttons.some(button => button.name = 'review_and_pay');
            // Se o botão específico foi encontrado
            if (bodyTextWithPix) {
                console.log("Mensagem de PIX detectada.");
            }
            else {
                console.log("Nenhuma mensagem de PIX encontrada.");
                return ''; // Retorna vazio se não encontrar o botão
            }
            // Log do bodyMessage final antes do retorno
            console.log("bodyMessage final:", bodyMessage);
            return bodyMessage; // Retorna [PIX]
        }
    }
    catch (error) {
        console.error("Erro ao processar mensagem:", error);
    }
    return ''; // Retorna uma string vazia se a condição inicial não for satisfeita
};
const msgLocation = (image, latitude, longitude) => {
    if (image) {
        var b64 = Buffer.from(image).toString("base64");
        let data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
        return data;
    }
};
const getBodyMessage = (msg) => {
    try {
        let type = getTypeMessage(msg);
        if (type === undefined)
            console.log(JSON.stringify(msg));
        const types = {
            conversation: msg.message?.conversation,
            imageMessage: msg.message?.imageMessage?.caption,
            videoMessage: msg.message?.videoMessage?.caption,
            ptvMessage: msg.message?.ptvMessage?.caption,
            extendedTextMessage: msg?.message?.extendedTextMessage?.text,
            buttonsResponseMessage: msg.message?.buttonsResponseMessage?.selectedDisplayText,
            listResponseMessage: msg.message?.listResponseMessage?.title ||
                msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
            templateButtonReplyMessage: msg.message?.templateButtonReplyMessage?.selectedId,
            messageContextInfo: msg.message?.buttonsResponseMessage?.selectedButtonId ||
                msg.message?.listResponseMessage?.title,
            buttonsMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.title,
            stickerMessage: "sticker",
            contactMessage: msg.message?.contactMessage?.vcard,
            contactsArrayMessage: msg.message?.contactsArrayMessage?.contacts &&
                contactsArrayMessageGet(msg),
            //locationMessage: `Latitude: ${msg.message.locationMessage?.degreesLatitude} - Longitude: ${msg.message.locationMessage?.degreesLongitude}`,
            locationMessage: msgLocation(msg.message?.locationMessage?.jpegThumbnail, msg.message?.locationMessage?.degreesLatitude, msg.message?.locationMessage?.degreesLongitude),
            liveLocationMessage: `Latitude: ${msg.message?.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message?.liveLocationMessage?.degreesLongitude}`,
            documentMessage: msg.message?.documentMessage?.caption,
            audioMessage: "Áudio",
            interactiveMessage: getBodyPIX(msg),
            listMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.title,
            viewOnceMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
            reactionMessage: msg.message?.reactionMessage?.text || "reaction",
            senderKeyDistributionMessage: msg?.message?.senderKeyDistributionMessage
                ?.axolotlSenderKeyDistributionMessage,
            documentWithCaptionMessage: msg.message?.documentWithCaptionMessage?.message?.documentMessage
                ?.caption,
            viewOnceMessageV2: msg.message?.viewOnceMessageV2?.message?.imageMessage?.caption,
            adMetaPreview: msgAdMetaPreview(msg.message?.extendedTextMessage?.contextInfo?.externalAdReply?.thumbnail, msg.message?.extendedTextMessage?.contextInfo?.externalAdReply?.title, msg.message?.extendedTextMessage?.contextInfo?.externalAdReply?.body, msg.message?.extendedTextMessage?.contextInfo?.externalAdReply?.sourceUrl, msg.message?.extendedTextMessage?.text),
            editedMessage: msg?.message?.protocolMessage?.editedMessage?.conversation ||
                msg?.message?.editedMessage?.message?.protocolMessage?.editedMessage
                    ?.conversation,
            ephemeralMessage: msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text,
            imageWhitCaptionMessage: msg?.message?.ephemeralMessage?.message?.imageMessage,
            highlyStructuredMessage: msg.message?.highlyStructuredMessage,
            protocolMessage: msg?.message?.protocolMessage?.editedMessage?.conversation,
            advertising: getAd(msg) ||
                msg.message?.listResponseMessage?.contextInfo?.externalAdReply?.title,
            pollCreationMessageV3: msg?.message?.pollCreationMessageV3 ? `*Enquete*\n${msg.message.pollCreationMessageV3.name}\n\n${msg.message.pollCreationMessageV3.options.map(option => option.optionName).join('\n')}` : null,
            eventMessage: msg?.message?.eventMessage?.name ? `*Nome do Evento: ${msg.message.eventMessage.name}*\n` : 'sem nome do evento\n',
        };
        const objKey = Object.keys(types).find(key => key === type);
        if (!objKey) {
            logger_1.default.warn(`#### Nao achou o type 152: ${type} ${JSON.stringify(msg.message)}`);
            Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
            Sentry.captureException(new Error("Novo Tipo de Mensagem em getTypeMessage"));
        }
        return types[type];
    }
    catch (error) {
        Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
        Sentry.captureException(error);
        console.log(error);
    }
};
exports.getBodyMessage = getBodyMessage;
const msgAdMetaPreview = (image, title, body, sourceUrl, messageUser) => {
    if (image) {
        var b64 = Buffer.from(image).toString("base64");
        let data = `data:image/png;base64, ${b64} | ${sourceUrl} | ${title} | ${body} | ${messageUser}`;
        return data;
    }
};
const getQuotedMessage = (msg) => {
    const body = (0, baileys_1.extractMessageContent)(msg.message)[Object.keys(msg?.message).values().next().value];
    if (!body?.contextInfo?.quotedMessage)
        return;
    const quoted = (0, baileys_1.extractMessageContent)(body?.contextInfo?.quotedMessage[Object.keys(body?.contextInfo?.quotedMessage).values().next().value]);
    return quoted;
};
exports.getQuotedMessage = getQuotedMessage;
const getQuotedMessageId = (msg) => {
    const body = (0, baileys_1.extractMessageContent)(msg.message)[Object.keys(msg?.message).values().next().value];
    let reaction = msg?.message?.reactionMessage
        ? msg?.message?.reactionMessage?.key?.id
        : "";
    return reaction ? reaction : body?.contextInfo?.stanzaId;
};
exports.getQuotedMessageId = getQuotedMessageId;
const getMeSocket = (wbot) => {
    return {
        id: (0, baileys_1.jidNormalizedUser)(wbot.user.id),
        name: wbot.user.name
    };
};
const getSenderMessage = (msg, wbot) => {
    const me = getMeSocket(wbot);
    if (msg.key.fromMe)
        return me.id;
    const senderId = msg.participant || msg.key.participant || msg.key.remoteJid || undefined;
    return senderId && (0, baileys_1.jidNormalizedUser)(senderId);
};
const getContactMessage = async (msg, wbot) => {
    const isGroup = msg.key.remoteJid.includes("g.us");
    const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
    return isGroup
        ? {
            id: getSenderMessage(msg, wbot),
            name: msg.pushName
        }
        : {
            id: msg.key.remoteJid,
            name: msg.key.fromMe ? rawNumber : msg.pushName
        };
};
function findCaption(obj) {
    if (typeof obj !== "object" || obj === null) {
        return null;
    }
    for (const key in obj) {
        if (key === "caption" || key === "text" || key === "conversation") {
            return obj[key];
        }
        const result = findCaption(obj[key]);
        if (result) {
            return result;
        }
    }
    return null;
}
// const downloadMedia = async (msg: proto.IWebMessageInfo, companyId: number, whatsappId: number) => {
//   const mineType =
//     msg.message?.imageMessage ||
//     msg.message?.audioMessage ||
//     msg.message?.videoMessage ||
//     msg.message?.stickerMessage ||
//     msg.message?.documentMessage ||
//     msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
//     // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
//     // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
//     // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
//     msg.message?.ephemeralMessage?.message?.audioMessage ||
//     msg.message?.ephemeralMessage?.message?.documentMessage ||
//     msg.message?.ephemeralMessage?.message?.videoMessage ||
//     msg.message?.ephemeralMessage?.message?.stickerMessage ||
//     msg.message?.ephemeralMessage?.message?.imageMessage ||
//     msg.message?.viewOnceMessage?.message?.imageMessage ||
//     msg.message?.viewOnceMessage?.message?.videoMessage ||
//     msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.imageMessage ||
//     msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.videoMessage ||
//     msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.audioMessage ||
//     msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.documentMessage ||
//     msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
//     msg.message?.templateMessage?.hydratedTemplate?.documentMessage ||
//     msg.message?.templateMessage?.hydratedTemplate?.videoMessage ||
//     msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
//     msg.message?.templateMessage?.hydratedFourRowTemplate?.documentMessage ||
//     msg.message?.templateMessage?.hydratedFourRowTemplate?.videoMessage ||
//     msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
//     msg.message?.templateMessage?.fourRowTemplate?.documentMessage ||
//     msg.message?.templateMessage?.fourRowTemplate?.videoMessage ||
//     msg.message?.interactiveMessage?.header?.imageMessage ||
//     msg.message?.interactiveMessage?.header?.documentMessage ||
//     msg.message?.interactiveMessage?.header?.videoMessage;
//   // eslint-disable-next-line no-nested-ternary
//   const messageType = msg.message?.documentMessage
//     ? "document"
//     : mineType.mimetype.split("/")[0].replace("application", "document")
//       ? (mineType.mimetype
//         .split("/")[0]
//         .replace("application", "document") as MediaType)
//       : (mineType.mimetype.split("/")[0] as MediaType);
//   let stream: Transform;
//   let contDownload = 0;
//   while (contDownload < 10 && !stream) {
//     try {
//       const { mediaKey, directPath, url } =
//         msg.message?.imageMessage ||
//         msg.message?.audioMessage ||
//         msg.message?.videoMessage ||
//         msg.message?.stickerMessage ||
//         msg.message?.documentMessage ||
//         msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
//         msg.message?.ephemeralMessage?.message?.audioMessage ||
//         msg.message?.ephemeralMessage?.message?.documentMessage ||
//         msg.message?.ephemeralMessage?.message?.videoMessage ||
//         msg.message?.ephemeralMessage?.message?.stickerMessage ||
//         msg.message?.ephemeralMessage?.message?.imageMessage ||
//         msg.message?.viewOnceMessage?.message?.imageMessage ||
//         msg.message?.viewOnceMessage?.message?.videoMessage ||
//         msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.imageMessage ||
//         msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.videoMessage ||
//         msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.audioMessage ||
//         msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.documentMessage ||
//         msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
//         msg.message?.templateMessage?.hydratedTemplate?.documentMessage ||
//         msg.message?.templateMessage?.hydratedTemplate?.videoMessage ||
//         msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
//         msg.message?.templateMessage?.hydratedFourRowTemplate?.documentMessage ||
//         msg.message?.templateMessage?.hydratedFourRowTemplate?.videoMessage ||
//         msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
//         msg.message?.templateMessage?.fourRowTemplate?.documentMessage ||
//         msg.message?.templateMessage?.fourRowTemplate?.videoMessage ||
//         msg.message?.interactiveMessage?.header?.imageMessage ||
//         msg.message?.interactiveMessage?.header?.documentMessage ||
//         msg.message?.interactiveMessage?.header?.videoMessage ||
//         { mediakey: undefined, directPath: undefined, url: undefined };
//       // eslint-disable-next-line no-await-in-loop
//       stream = await downloadContentFromMessage(
//         { mediaKey, directPath, url: directPath ? "" : url },
//         messageType
//       );
//     } catch (error) {
//       contDownload += 1;
//       // eslint-disable-next-line no-await-in-loop, no-loop-func
//       await new Promise(resolve => { setTimeout(resolve, 1000 * contDownload * 2) }
//       );
//       logger.warn(
//         `>>>> erro ${contDownload} de baixar o arquivo ${msg?.key.id} companie ${companyId} conexão ${whatsappId}`
//       );
//       if (contDownload === 10) {
//         logger.warn(
//           `>>>> erro ao baixar o arquivo ${JSON.stringify(msg)}`
//         );
//       }
//     }
//   }
//   let buffer = Buffer.from([]);
//   try {
//     // eslint-disable-next-line no-restricted-syntax
//     for await (const chunk of stream) {
//       buffer = Buffer.concat([buffer, chunk]);
//     }
//   } catch (error) {
//     return { data: "error", mimetype: "", filename: "" };
//   }
//   if (!buffer) {
//     Sentry.setExtra("ERR_WAPP_DOWNLOAD_MEDIA", { msg });
//     Sentry.captureException(new Error("ERR_WAPP_DOWNLOAD_MEDIA"));
//     throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
//   }
//   let filename = msg.message?.documentMessage?.fileName || "";
//   if (!filename) {
//     const ext = mineType.mimetype.split("/")[1].split(";")[0];
//     filename = `${new Date().getTime()}.${ext}`;
//   }
//   const media = {
//     data: buffer,
//     mimetype: mineType.mimetype,
//     filename
//   };
//   return media;
// };
const getUnpackedMessage = (msg) => {
    return (msg.message?.documentWithCaptionMessage?.message ||
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
        msg.message?.ephemeralMessage?.message ||
        msg.message?.viewOnceMessage?.message ||
        msg.message?.viewOnceMessageV2?.message ||
        msg.message?.ephemeralMessage?.message ||
        msg.message?.templateMessage?.hydratedTemplate ||
        msg.message?.templateMessage?.hydratedFourRowTemplate ||
        msg.message?.templateMessage?.fourRowTemplate ||
        msg.message?.interactiveMessage?.header ||
        msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate ||
        msg.message);
};
const getMessageMedia = (message) => {
    return (message?.imageMessage ||
        message?.audioMessage ||
        message?.videoMessage ||
        message?.stickerMessage ||
        message?.documentMessage || null);
};
const downloadMedia = async (msg, isImported = null, wbot, ticket) => {
    const unpackedMessage = getUnpackedMessage(msg);
    const message = getMessageMedia(unpackedMessage);
    if (!message) {
        return null;
    }
    const fileLimit = parseInt(await (0, CheckSettings_1.CheckSettings1)("downloadLimit", "15"), 10);
    if (wbot && message?.fileLength && +message.fileLength > fileLimit * 1024 * 1024) {
        const fileLimitMessage = {
            text: `\u200e*Mensagem Automática*:\nNosso sistema aceita apenas arquivos com no máximo ${fileLimit} MiB`
        };
        const sendMsg = await wbot.sendMessage(`${ticket.contact.number}@${"s.whatsapp.net"}`, fileLimitMessage);
        sendMsg.message.extendedTextMessage.text = "\u200e*Mensagem do sistema*:\nArquivo recebido além do limite de tamanho do sistema, se for necessário ele pode ser obtido no aplicativo do whatsapp.";
        // eslint-disable-next-line no-use-before-define
        await (0, exports.verifyMessage)(sendMsg, ticket, ticket.contact);
        throw new Error("ERR_FILESIZE_OVER_LIMIT");
    }
    if (msg.message?.stickerMessage) {
        const urlAnt = "https://web.whatsapp.net";
        const directPath = msg.message?.stickerMessage?.directPath;
        const newUrl = "https://mmg.whatsapp.net";
        const final = newUrl + directPath;
        if (msg.message?.stickerMessage?.url?.includes(urlAnt)) {
            msg.message.stickerMessage.url = msg.message?.stickerMessage.url.replace(urlAnt, final);
        }
    }
    let buffer;
    try {
        buffer = await (0, baileys_1.downloadMediaMessage)(msg, "buffer", {}, {
            logger: logger_1.default,
            reuploadRequest: wbot.updateMediaMessage
        });
    }
    catch (err) {
        if (isImported) {
            console.log("Falha ao fazer o download de uma mensagem importada, provavelmente a mensagem já não esta mais disponível");
        }
        else {
            console.error("Erro ao baixar mídia:", err);
        }
    }
    let filename = msg.message?.documentMessage?.fileName || "";
    const mineType = msg.message?.imageMessage ||
        msg.message?.audioMessage ||
        msg.message?.videoMessage ||
        msg.message?.stickerMessage ||
        msg.message?.ephemeralMessage?.message?.stickerMessage ||
        msg.message?.documentMessage ||
        msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
        msg.message?.ephemeralMessage?.message?.audioMessage ||
        msg.message?.ephemeralMessage?.message?.documentMessage ||
        msg.message?.ephemeralMessage?.message?.videoMessage ||
        msg.message?.ephemeralMessage?.message?.imageMessage ||
        msg.message?.viewOnceMessage?.message?.imageMessage ||
        msg.message?.viewOnceMessage?.message?.videoMessage ||
        msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
            ?.imageMessage ||
        msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
            ?.videoMessage ||
        msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
            ?.audioMessage ||
        msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
            ?.documentMessage ||
        msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
        msg.message?.templateMessage?.hydratedTemplate?.documentMessage ||
        msg.message?.templateMessage?.hydratedTemplate?.videoMessage ||
        msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
        msg.message?.templateMessage?.hydratedFourRowTemplate?.documentMessage ||
        msg.message?.templateMessage?.hydratedFourRowTemplate?.videoMessage ||
        msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
        msg.message?.templateMessage?.fourRowTemplate?.documentMessage ||
        msg.message?.templateMessage?.fourRowTemplate?.videoMessage ||
        msg.message?.interactiveMessage?.header?.imageMessage ||
        msg.message?.interactiveMessage?.header?.documentMessage ||
        msg.message?.interactiveMessage?.header?.videoMessage;
    if (!filename) {
        const ext = mineType.mimetype.split("/")[1].split(";")[0];
        filename = `${new Date().getTime()}.${ext}`;
    }
    else {
        filename = `${new Date().getTime()}_${filename}`;
    }
    const media = {
        data: buffer,
        mimetype: mineType.mimetype,
        filename
    };
    return media;
};
const verifyContact = async (msgContact, wbot, companyId) => {
    let profilePicUrl = "";
    // try {
    //   profilePicUrl = await wbot.profilePictureUrl(msgContact.id, "image");
    // } catch (e) {
    //   Sentry.captureException(e);
    //   profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
    // }
    const contactData = {
        name: msgContact.name || msgContact.id.replace(/\D/g, ""),
        number: msgContact.id.replace(/\D/g, ""),
        profilePicUrl,
        isGroup: msgContact.id.includes("g.us"),
        companyId,
        remoteJid: msgContact.id,
        whatsappId: wbot.id,
        wbot
    };
    if (contactData.isGroup) {
        contactData.number = msgContact.id.replace("@g.us", "");
    }
    const contact = await (0, CreateOrUpdateContactService_1.default)(contactData);
    return contact;
};
const verifyQuotedMessage = async (msg) => {
    if (!msg)
        return null;
    const quoted = (0, exports.getQuotedMessageId)(msg);
    if (!quoted)
        return null;
    const quotedMsg = await Message_1.default.findOne({
        where: { wid: quoted }
    });
    if (!quotedMsg)
        return null;
    return quotedMsg;
};
const verifyMediaMessage = async (msg, ticket, contact, ticketTraking, isForwarded = false, isPrivate = false, wbot) => {
    const io = (0, socket_1.getIO)();
    const quotedMsg = await verifyQuotedMessage(msg);
    const companyId = ticket.companyId;
    try {
        const media = await downloadMedia(msg, ticket?.imported, wbot, ticket);
        if (!media && ticket.imported) {
            const body = "*System:* \nFalha no download da mídia verifique no dispositivo";
            const messageData = {
                //mensagem de texto
                wid: msg.key.id,
                ticketId: ticket.id,
                contactId: msg.key.fromMe ? undefined : ticket.contactId,
                body,
                reactionMessage: msg.message?.reactionMessage,
                fromMe: msg.key.fromMe,
                mediaType: getTypeMessage(msg),
                read: msg.key.fromMe,
                quotedMsgId: quotedMsg?.id || msg.message?.reactionMessage?.key?.id,
                ack: msg.status,
                companyId: companyId,
                remoteJid: msg.key.remoteJid,
                participant: msg.key.participant,
                timestamp: getTimestampMessage(msg.messageTimestamp),
                createdAt: new Date(Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)).toISOString(),
                dataJson: JSON.stringify(msg),
                ticketImported: ticket.imported,
                isForwarded,
                isPrivate
            };
            await ticket.update({
                lastMessage: body
            });
            logger_1.default.error(Error("ERR_WAPP_DOWNLOAD_MEDIA"));
            return (0, CreateMessageService_1.default)({ messageData, companyId: companyId });
        }
        if (!media) {
            throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
        }
        // if (!media.filename || media.mimetype === "audio/mp4") {
        //   const ext = media.mimetype === "audio/mp4" ? "m4a" : media.mimetype.split("/")[1].split(";")[0];
        //   media.filename = `${new Date().getTime()}.${ext}`;
        // } else {
        //   // ext = tudo depois do ultimo .
        //   const ext = media.filename.split(".").pop();
        //   // name = tudo antes do ultimo .
        //   const name = media.filename.split(".").slice(0, -1).join(".").replace(/\s/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        //   media.filename = `${name.trim()}_${new Date().getTime()}.${ext}`;
        // }
        if (!media.filename) {
            const ext = media.mimetype.split("/")[1].split(";")[0];
            media.filename = `${new Date().getTime()}.${ext}`;
        }
        else {
            // ext = tudo depois do ultimo .
            const ext = media.filename.split(".").pop();
            // name = tudo antes do ultimo .
            const name = media.filename
                .split(".")
                .slice(0, -1)
                .join(".")
                .replace(/\s/g, "_")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            media.filename = `${name.trim()}_${new Date().getTime()}.${ext}`;
        }
        try {
            const folder = path_1.default.resolve(__dirname, "..", "..", "..", "public", `company${companyId}`);
            // const folder = `public/company${companyId}`; // Correção adicionada por Altemir 16-08-2023
            if (!fs_2.default.existsSync(folder)) {
                fs_2.default.mkdirSync(folder, { recursive: true }); // Correção adicionada por Altemir 16-08-2023
                fs_2.default.chmodSync(folder, 0o777);
            }
            await writeFileAsync((0, path_1.join)(folder, media.filename), media.data.toString("base64"), "base64") // Correção adicionada por Altemir 16-08-2023
                .then(() => {
                // console.log("Arquivo salvo com sucesso!");
                if (media.mimetype.includes("audio")) {
                    console.log(media.mimetype);
                    const inputFile = path_1.default.join(folder, media.filename);
                    let outputFile;
                    if (inputFile.endsWith(".mpeg")) {
                        outputFile = inputFile.replace(".mpeg", ".mp3");
                    }
                    else if (inputFile.endsWith(".ogg")) {
                        outputFile = inputFile.replace(".ogg", ".mp3");
                    }
                    else {
                        // Trate outros formatos de arquivo conforme necessário
                        //console.error("Formato de arquivo não suportado:", inputFile);
                        return;
                    }
                    return new Promise((resolve, reject) => {
                        (0, fluent_ffmpeg_1.default)(inputFile)
                            .toFormat("mp3")
                            .save(outputFile)
                            .on("end", () => {
                            resolve();
                        })
                            .on("error", (err) => {
                            reject(err);
                        });
                    });
                }
            });
            // .then(() => {
            //   //console.log("Conversão concluída!");
            //   // Aqui você pode fazer o que desejar com o arquivo MP3 convertido.
            // })
        }
        catch (err) {
            Sentry.setExtra("Erro media", {
                companyId: companyId,
                ticket,
                contact,
                media,
                quotedMsg
            });
            Sentry.captureException(err);
            logger_1.default.error(err);
            console.log(msg);
        }
        const body = (0, exports.getBodyMessage)(msg);
        const messageData = {
            wid: msg.key.id,
            ticketId: ticket.id,
            contactId: msg.key.fromMe ? undefined : contact.id,
            body: body || media.filename,
            fromMe: msg.key.fromMe,
            read: msg.key.fromMe,
            mediaUrl: media.filename,
            mediaType: media.mimetype.split("/")[0],
            quotedMsgId: quotedMsg?.id,
            ack: Number(String(msg.status).replace("PENDING", "2").replace("NaN", "1")) || 2,
            remoteJid: msg.key.remoteJid,
            participant: msg.key.participant,
            dataJson: JSON.stringify(msg),
            ticketTrakingId: ticketTraking?.id,
            createdAt: new Date(Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)).toISOString(),
            ticketImported: ticket.imported,
            isForwarded,
            isPrivate
        };
        await ticket.update({
            lastMessage: body || media.filename
        });
        const newMessage = await (0, CreateMessageService_1.default)({
            messageData,
            companyId: companyId
        });
        if (!msg.key.fromMe && ticket.status === "closed") {
            await ticket.update({ status: "pending" });
            await ticket.reload({
                attributes: [
                    "id",
                    "uuid",
                    "queueId",
                    "isGroup",
                    "channel",
                    "status",
                    "contactId",
                    "useIntegration",
                    "lastMessage",
                    "updatedAt",
                    "unreadMessages",
                    "companyId",
                    "whatsappId",
                    "imported",
                    "lgpdAcceptedAt",
                    "amountUsedBotQueues",
                    "useIntegration",
                    "integrationId",
                    "userId",
                    "amountUsedBotQueuesNPS",
                    "lgpdSendMessageAt",
                    "isBot"
                ],
                include: [
                    { model: Queue_1.default, as: "queue" },
                    { model: User_1.default, as: "user" },
                    { model: Contact_1.default, as: "contact" },
                    { model: Whatsapp_1.default, as: "whatsapp" }
                ]
            });
            io.of(String(companyId))
                // .to("closed")
                .emit(`company-${companyId}-ticket`, {
                action: "delete",
                ticket,
                ticketId: ticket.id
            });
            // console.log("emitiu socket 902", ticket.id)
            io.of(String(companyId))
                // .to(ticket.status)
                //   .to(ticket.id.toString())
                .emit(`company-${companyId}-ticket`, {
                action: "update",
                ticket,
                ticketId: ticket.id
            });
        }
        return newMessage;
    }
    catch (error) {
        console.log(error);
        logger_1.default.warn("Erro ao baixar media: ", JSON.stringify(msg));
    }
};
exports.verifyMediaMessage = verifyMediaMessage;
const verifyMessage = async (msg, ticket, contact, ticketTraking, isPrivate, isForwarded = false) => {
    // console.log("Mensagem recebida:", JSON.stringify(msg, null, 2));
    const io = (0, socket_1.getIO)();
    const quotedMsg = await verifyQuotedMessage(msg);
    const body = (0, exports.getBodyMessage)(msg);
    const companyId = ticket.companyId;
    const messageData = {
        wid: msg.key.id,
        ticketId: ticket.id,
        contactId: msg.key.fromMe ? undefined : contact.id,
        body,
        fromMe: msg.key.fromMe,
        mediaType: getTypeMessage(msg),
        read: msg.key.fromMe,
        quotedMsgId: quotedMsg?.id,
        ack: Number(String(msg.status).replace("PENDING", "2").replace("NaN", "1")) ||
            2,
        remoteJid: msg.key.remoteJid,
        participant: msg.key.participant,
        dataJson: JSON.stringify(msg),
        ticketTrakingId: ticketTraking?.id,
        isPrivate,
        createdAt: new Date(Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)).toISOString(),
        ticketImported: ticket.imported,
        isForwarded
    };
    await ticket.update({
        lastMessage: body
    });
    await (0, CreateMessageService_1.default)({ messageData, companyId: companyId });
    if (!msg.key.fromMe && ticket.status === "closed") {
        console.log("===== CHANGE =====");
        await ticket.update({ status: "pending" });
        await ticket.reload({
            include: [
                { model: Queue_1.default, as: "queue" },
                { model: User_1.default, as: "user" },
                { model: Contact_1.default, as: "contact" },
                { model: Whatsapp_1.default, as: "whatsapp" }
            ]
        });
        // io.to("closed").emit(`company-${companyId}-ticket`, {
        //   action: "delete",
        //   ticket,
        //   ticketId: ticket.id
        // });
        if (!ticket.imported) {
            io.of(String(companyId))
                // .to(ticket.status)
                // .to(ticket.id.toString())
                .emit(`company-${companyId}-ticket`, {
                action: "update",
                ticket,
                ticketId: ticket.id
            });
        }
    }
};
exports.verifyMessage = verifyMessage;
const isValidMsg = (msg) => {
    if (msg.key.remoteJid === "status@broadcast")
        return false;
    try {
        const msgType = getTypeMessage(msg);
        if (!msgType) {
            return;
        }
        const ifType = msgType === "conversation" ||
            msgType === "extendedTextMessage" ||
            msgType === "audioMessage" ||
            msgType === "videoMessage" ||
            msgType === "ptvMessage" ||
            msgType === "imageMessage" ||
            msgType === "documentMessage" ||
            msgType === "stickerMessage" ||
            msgType === "buttonsResponseMessage" ||
            msgType === "buttonsMessage" ||
            msgType === "messageContextInfo" ||
            msgType === "locationMessage" ||
            msgType === "liveLocationMessage" ||
            msgType === "contactMessage" ||
            msgType === "voiceMessage" ||
            msgType === "mediaMessage" ||
            msgType === "contactsArrayMessage" ||
            msgType === "reactionMessage" ||
            msgType === "ephemeralMessage" ||
            msgType === "protocolMessage" ||
            msgType === "listResponseMessage" ||
            msgType === "listMessage" ||
            msgType === "interactiveMessage" ||
            msgType === "pollCreationMessageV3" ||
            msgType === "viewOnceMessage" ||
            msgType === "documentWithCaptionMessage" ||
            msgType === "viewOnceMessageV2" ||
            msgType === "editedMessage" ||
            msgType === "advertisingMessage" ||
            msgType === "highlyStructuredMessage" ||
            msgType === "eventMessage" ||
            msgType === "adMetaPreview"; // Adicionado para tratar mensagens de anúncios
        if (!ifType) {
            logger_1.default.warn(`#### Nao achou o type em isValidMsg: ${msgType}
${JSON.stringify(msg?.message)}`);
            Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
            Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
        }
        return !!ifType;
    }
    catch (error) {
        Sentry.setExtra("Error isValidMsg", { msg });
        Sentry.captureException(error);
    }
};
exports.isValidMsg = isValidMsg;
const sendDialogflowAwswer = async (wbot, ticket, msg, contact, inputAudio, companyId, queueIntegration) => {
    const session = await (0, CreateSessionDialogflow_1.createDialogflowSessionWithModel)(queueIntegration);
    if (session === undefined) {
        return;
    }
    wbot.presenceSubscribe(contact.remoteJid);
    await (0, baileys_1.delay)(500);
    let dialogFlowReply = await (0, QueryDialogflow_1.queryDialogFlow)(session, queueIntegration.projectName, contact.remoteJid, (0, exports.getBodyMessage)(msg), queueIntegration.language, inputAudio);
    if (!dialogFlowReply) {
        wbot.sendPresenceUpdate("composing", contact.remoteJid);
        const bodyDuvida = (0, Mustache_1.default)(`\u200e *${queueIntegration?.name}:* Não consegui entender sua dúvida.`);
        await (0, baileys_1.delay)(1000);
        await wbot.sendPresenceUpdate("paused", contact.remoteJid);
        const sentMessage = await wbot.sendMessage(`${contact.number}@c.us`, {
            text: bodyDuvida
        });
        await (0, exports.verifyMessage)(sentMessage, ticket, contact);
        return;
    }
    if (dialogFlowReply.endConversation) {
        await ticket.update({
            contactId: ticket.contact.id,
            useIntegration: false
        });
    }
    const image = dialogFlowReply.parameters.image?.stringValue ?? undefined;
    const react = dialogFlowReply.parameters.react?.stringValue ?? undefined;
    const audio = dialogFlowReply.encodedAudio.toString("base64") ?? undefined;
    wbot.sendPresenceUpdate("composing", contact.remoteJid);
    await (0, baileys_1.delay)(500);
    let lastMessage;
    for (let message of dialogFlowReply.responses) {
        lastMessage = message.text.text[0] ? message.text.text[0] : lastMessage;
    }
    for (let message of dialogFlowReply.responses) {
        if (message.text) {
            await sendDelayedMessages(wbot, ticket, contact, message.text.text[0], lastMessage, audio, queueIntegration);
        }
    }
};
async function sendDelayedMessages(wbot, ticket, contact, message, lastMessage, audio, queueIntegration) {
    const companyId = ticket.companyId;
    // console.log("GETTING WHATSAPP SEND DELAYED MESSAGES", ticket.whatsappId, wbot.id)
    const whatsapp = await (0, ShowWhatsAppService_1.default)(wbot.id, companyId);
    const farewellMessage = whatsapp.farewellMessage.replace(/[_*]/g, "");
    // if (react) {
    //   const test =
    //     /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(
    //       react
    //     );
    //   if (test) {
    //     msg.react(react);
    //     await delay(1000);
    //   }
    // }
    const sentMessage = await wbot.sendMessage(`${contact.number}@c.us`, {
        text: `\u200e *${queueIntegration?.name}:* ` + message
    });
    await (0, exports.verifyMessage)(sentMessage, ticket, contact);
    if (message != lastMessage) {
        await (0, baileys_1.delay)(500);
        wbot.sendPresenceUpdate("composing", contact.remoteJid);
    }
    else if (audio) {
        wbot.sendPresenceUpdate("recording", contact.remoteJid);
        await (0, baileys_1.delay)(500);
        // if (audio && message === lastMessage) {
        //   const newMedia = new MessageMedia("audio/ogg", audio);
        //   const sentMessage = await wbot.sendMessage(
        //     `${contact.number}@c.us`,
        //     newMedia,
        //     {
        //       sendAudioAsVoice: true
        //     }
        //   );
        //   await verifyMessage(sentMessage, ticket, contact);
        // }
        // if (sendImage && message === lastMessage) {
        //   const newMedia = await MessageMedia.fromUrl(sendImage, {
        //     unsafeMime: true
        //   });
        //   const sentMessage = await wbot.sendMessage(
        //     `${contact.number}@c.us`,
        //     newMedia,
        //     {
        //       sendAudioAsVoice: true
        //     }
        //   );
        //   await verifyMessage(sentMessage, ticket, contact);
        //   await ticket.update({ lastMessage: "📷 Foto" });
        // }
        if (farewellMessage && message.includes(farewellMessage)) {
            await (0, baileys_1.delay)(1000);
            setTimeout(async () => {
                await ticket.update({
                    contactId: ticket.contact.id,
                    useIntegration: true
                });
                await (0, UpdateTicketService_1.default)({
                    ticketId: ticket.id,
                    ticketData: { status: "closed" },
                    companyId: companyId
                });
            }, 3000);
        }
    }
}
const verifyQueue = async (wbot, msg, ticket, contact, settings, ticketTraking) => {
    const companyId = ticket.companyId;
    console.log("verifyQueue");
    // console.log("GETTING WHATSAPP VERIFY QUEUE", ticket.whatsappId, wbot.id)
    const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } = await (0, ShowWhatsAppService_1.default)(wbot.id, companyId);
    let chatbot = false;
    if (queues.length === 1) {
        console.log("log... 1186");
        chatbot = queues[0]?.chatbots.length > 1;
    }
    const enableQueuePosition = settings.sendQueuePosition === "enabled";
    if (queues.length === 1 && !chatbot) {
        const sendGreetingMessageOneQueues = settings.sendGreetingMessageOneQueues === "enabled" || false;
        console.log("log... 1195");
        //inicia integração dialogflow/n8n
        if (!msg.key.fromMe && !ticket.isGroup && queues[0].integrationId) {
            const integrations = await (0, ShowQueueIntegrationService_1.default)(queues[0].integrationId, companyId);
            console.log("log... 1206");
            await (0, exports.handleMessageIntegration)(msg, wbot, companyId, integrations, ticket, null, null, null, null);
            if (msg.key.fromMe) {
                console.log("log... 1211");
                await ticket.update({
                    typebotSessionTime: (0, moment_1.default)().toDate(),
                    useIntegration: true,
                    integrationId: integrations.id
                });
            }
            else {
                await ticket.update({
                    useIntegration: true,
                    integrationId: integrations.id
                });
            }
            // return;
        }
        if (greetingMessage.length > 1 && sendGreetingMessageOneQueues) {
            console.log("log... 1226");
            const body = (0, Mustache_1.default)(`${greetingMessage}`, ticket);
            if (ticket.whatsapp.greetingMediaAttachment !== null) {
                const filePath = path_1.default.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);
                const fileExists = fs_2.default.existsSync(filePath);
                if (fileExists) {
                    console.log("log... 1235");
                    const messagePath = ticket.whatsapp.greetingMediaAttachment;
                    const optionsMsg = await (0, SendWhatsAppMedia_1.getMessageOptions)(messagePath, filePath, String(companyId), body);
                    const debouncedSentgreetingMediaAttachment = (0, Debounce_1.debounce)(async () => {
                        const sentMessage = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, { ...optionsMsg });
                        await (0, exports.verifyMediaMessage)(sentMessage, ticket, contact, ticketTraking, false, false, wbot);
                    }, 1000, ticket.id);
                    debouncedSentgreetingMediaAttachment();
                }
                else {
                    console.log("log... 1250");
                    await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                        text: body
                    });
                }
            }
            else {
                console.log("log... 1259");
                await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
            }
        }
        if (!(0, lodash_1.isNil)(queues[0].fileListId)) {
            console.log("log... 1278");
            try {
                const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
                const files = await (0, ShowService_1.default)(queues[0].fileListId, ticket.companyId);
                const folder = path_1.default.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id));
                for (const [index, file] of files.options.entries()) {
                    const mediaSrc = {
                        fieldname: "medias",
                        originalname: file.path,
                        encoding: "7bit",
                        mimetype: file.mediaType,
                        filename: file.path,
                        path: path_1.default.resolve(folder, file.path)
                    };
                    await (0, SendWhatsAppMedia_1.default)({
                        media: mediaSrc,
                        ticket,
                        body: file.name,
                        isPrivate: false,
                        isForwarded: false
                    });
                }
            }
            catch (error) {
                logger_1.default.info(error);
            }
        }
        if (queues[0].closeTicket) {
            console.log("log... 1297");
            await (0, UpdateTicketService_1.default)({
                ticketData: {
                    status: "closed",
                    queueId: queues[0].id
                    // sendFarewellMessage: false
                },
                ticketId: ticket.id,
                companyId
            });
            return;
        }
        else {
            console.log("log... 1310");
            await (0, UpdateTicketService_1.default)({
                ticketData: {
                    queueId: queues[0].id,
                    status: ticket.status === "lgpd" ? "pending" : ticket.status
                },
                ticketId: ticket.id,
                companyId
            });
        }
        const count = await Ticket_1.default.findAndCountAll({
            where: {
                userId: null,
                status: "pending",
                companyId,
                queueId: queues[0].id,
                isGroup: false
            }
        });
        if (enableQueuePosition) {
            console.log("log... 1329");
            // Lógica para enviar posição da fila de atendimento
            const qtd = count.count === 0 ? 1 : count.count;
            const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;
            // const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
            const bodyFila = (0, Mustache_1.default)(`${msgFila}`, ticket);
            const debouncedSentMessagePosicao = (0, Debounce_1.debounce)(async () => {
                await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: bodyFila
                });
            }, 3000, ticket.id);
            debouncedSentMessagePosicao();
        }
        return;
    }
    // REGRA PARA DESABILITAR O BOT PARA ALGUM CONTATO
    if (contact.disableBot) {
        return;
    }
    let selectedOption = "";
    if (ticket.status !== "lgpd") {
        console.log("log... 1367");
        selectedOption =
            msg?.message?.buttonsResponseMessage?.selectedButtonId ||
                msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
                (0, exports.getBodyMessage)(msg);
    }
    else {
        if (!(0, lodash_1.isNil)(ticket.lgpdAcceptedAt))
            await ticket.update({
                status: "pending"
            });
        await ticket.reload();
    }
    if (String(selectedOption).toLocaleLowerCase() == "sair") {
        // Encerra atendimento
        console.log("log... 1384");
        const ticketData = {
            isBot: false,
            status: "closed",
            sendFarewellMessage: true,
            maxUseBotQueues: 0
        };
        await (0, UpdateTicketService_1.default)({ ticketData, ticketId: ticket.id, companyId });
        // await ticket.update({ queueOptionId: null, chatbot: false, queueId: null, userId: null, status: "closed"});
        //await verifyQueue(wbot, msg, ticket, ticket.contact);
        // const complationMessage = ticket.whatsapp?.complationMessage;
        // console.log(complationMessage)
        // const textMessage = {
        //   text: formatBody(`\u200e${complationMessage}`, ticket),
        // };
        // if (!isNil(complationMessage)) {
        //   const sendMsg = await wbot.sendMessage(
        //     `${ticket?.contact?.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        //     textMessage
        //   );
        //   await verifyMessage(sendMsg, ticket, ticket.contact);
        // }
        return;
    }
    let choosenQueue = chatbot && queues.length === 1
        ? queues[+selectedOption]
        : queues[+selectedOption - 1];
    console.log("log... 1419");
    const typeBot = settings?.chatBotType || "text";
    // Serviço p/ escolher consultor aleatório para o ticket, ao selecionar fila.
    let randomUserId;
    if (choosenQueue) {
        console.log("log... 1427");
        try {
            const userQueue = await (0, ListUserQueueServices_1.default)(choosenQueue.id);
            if (userQueue.userId > -1) {
                randomUserId = userQueue.userId;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    // Ativar ou desativar opção de escolher consultor aleatório.
    /*   let settings = await CompaniesSettings.findOne({
        where: {
          companyId: companyId
        }
      }); */
    const botText = async () => {
        console.log("log... 1449");
        if (choosenQueue || (queues.length === 1 && chatbot)) {
            console.log("log... 1452");
            // console.log("entrou no choose", ticket.isOutOfHour, ticketTraking.chatbotAt)
            if (queues.length === 1)
                choosenQueue = queues[0];
            const queue = await Queue_1.default.findByPk(choosenQueue.id);
            console.log("log... 1457");
            if (ticket.isOutOfHour === false && ticketTraking.chatbotAt !== null) {
                console.log("log... 1460");
                await ticketTraking.update({
                    chatbotAt: null
                });
                await ticket.update({
                    amountUsedBotQueues: 0
                });
            }
            let currentSchedule;
            if (settings?.scheduleType === "queue") {
                console.log("log... 1472");
                currentSchedule = await (0, VerifyCurrentSchedule_1.default)(companyId, queue.id, 0);
            }
            if (settings?.scheduleType === "queue" &&
                ticket.status !== "open" &&
                !(0, lodash_1.isNil)(currentSchedule) &&
                (ticket.amountUsedBotQueues < maxUseBotQueues ||
                    maxUseBotQueues === 0) &&
                (!currentSchedule || currentSchedule.inActivity === false) &&
                (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")) {
                if (timeUseBotQueues !== "0") {
                    console.log("log... 1483");
                    //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
                    //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
                    let dataLimite = new Date();
                    let Agora = new Date();
                    if (ticketTraking.chatbotAt !== null) {
                        console.log("log... 1491");
                        dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + Number(timeUseBotQueues));
                        if (ticketTraking.chatbotAt !== null &&
                            Agora < dataLimite &&
                            timeUseBotQueues !== "0" &&
                            ticket.amountUsedBotQueues !== 0) {
                            return;
                        }
                    }
                    await ticketTraking.update({
                        chatbotAt: null
                    });
                }
                const outOfHoursMessage = queue.outOfHoursMessage;
                if (outOfHoursMessage !== "") {
                    // console.log("entrei3");
                    const body = (0, Mustache_1.default)(`${outOfHoursMessage}`, ticket);
                    console.log("log... 1509");
                    const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
                        await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                            text: body
                        });
                    }, 1000, ticket.id);
                    debouncedSentMessage();
                    //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
                    // await ticket.update({
                    //   queueId: queue.id,
                    //   isOutOfHour: true,
                    //   amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                    // });
                    // return;
                }
                //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
                await ticket.update({
                    queueId: queue.id,
                    isOutOfHour: true,
                    amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                });
                return;
            }
            await (0, UpdateTicketService_1.default)({
                ticketData: {
                    // amountUsedBotQueues: 0,
                    queueId: choosenQueue.id
                },
                // ticketData: { queueId: queues.length ===1 ? null : choosenQueue.id },
                ticketId: ticket.id,
                companyId
            });
            // }
            if (choosenQueue.chatbots.length > 0 && !ticket.isGroup) {
                console.log("log... 1554");
                let options = "";
                choosenQueue.chatbots.forEach((chatbot, index) => {
                    options += `*[ ${index + 1} ]* - ${chatbot.name}\n`;
                });
                const body = (0, Mustache_1.default)(`\u200e ${choosenQueue.greetingMessage}\n\n${options}\n*[ # ]* Voltar para o menu principal\n*[ Sair ]* Encerrar atendimento`, ticket);
                const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
                await (0, exports.verifyMessage)(sentMessage, ticket, contact, ticketTraking);
                if (settings?.settingsUserRandom === "enabled") {
                    console.log("log... 1576");
                    await (0, UpdateTicketService_1.default)({
                        ticketData: { userId: randomUserId },
                        ticketId: ticket.id,
                        companyId
                    });
                }
            }
            if (!choosenQueue.chatbots.length &&
                choosenQueue.greetingMessage.length !== 0) {
                console.log("log... 1586");
                console.log(choosenQueue.greetingMessage);
                const body = (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, ticket);
                const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
                await (0, exports.verifyMessage)(sentMessage, ticket, contact, ticketTraking);
            }
            if (!(0, lodash_1.isNil)(choosenQueue.fileListId)) {
                try {
                    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
                    const files = await (0, ShowService_1.default)(choosenQueue.fileListId, ticket.companyId);
                    const folder = path_1.default.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id));
                    for (const [index, file] of files.options.entries()) {
                        const mediaSrc = {
                            fieldname: "medias",
                            originalname: file.path,
                            encoding: "7bit",
                            mimetype: file.mediaType,
                            filename: file.path,
                            path: path_1.default.resolve(folder, file.path)
                        };
                        // const debouncedSentMessagePosicao = debounce(
                        //   async () => {
                        const sentMessage = await (0, SendWhatsAppMedia_1.default)({
                            media: mediaSrc,
                            ticket,
                            body: `\u200e ${file.name}`,
                            isPrivate: false,
                            isForwarded: false
                        });
                        await (0, exports.verifyMediaMessage)(sentMessage, ticket, ticket.contact, ticketTraking, false, false, wbot);
                        //   },
                        //   2000,
                        //   ticket.id
                        // );
                        // debouncedSentMessagePosicao();
                    }
                }
                catch (error) {
                    logger_1.default.info(error);
                }
            }
            await (0, baileys_1.delay)(4000);
            //se fila está parametrizada para encerrar ticket automaticamente
            if (choosenQueue.closeTicket) {
                try {
                    await (0, UpdateTicketService_1.default)({
                        ticketData: {
                            status: "closed",
                            queueId: choosenQueue.id
                            // sendFarewellMessage: false,
                        },
                        ticketId: ticket.id,
                        companyId
                    });
                }
                catch (error) {
                    logger_1.default.info(error);
                }
                return;
            }
            const count = await Ticket_1.default.findAndCountAll({
                where: {
                    userId: null,
                    status: "pending",
                    companyId,
                    queueId: choosenQueue.id,
                    whatsappId: wbot.id,
                    isGroup: false
                }
            });
            console.log("======== choose queue ========");
            await (0, CreateLogTicketService_1.default)({
                ticketId: ticket.id,
                type: "queue",
                queueId: choosenQueue.id
            });
            if (enableQueuePosition && !choosenQueue.chatbots.length) {
                // Lógica para enviar posição da fila de atendimento
                const qtd = count.count === 0 ? 1 : count.count;
                const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;
                // const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
                const bodyFila = (0, Mustache_1.default)(`${msgFila}`, ticket);
                const debouncedSentMessagePosicao = (0, Debounce_1.debounce)(async () => {
                    await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                        text: bodyFila
                    });
                }, 3000, ticket.id);
                debouncedSentMessagePosicao();
            }
        }
        else {
            if (ticket.isGroup)
                return;
            if (maxUseBotQueues &&
                maxUseBotQueues !== 0 &&
                ticket.amountUsedBotQueues >= maxUseBotQueues) {
                // await UpdateTicketService({
                //   ticketData: { queueId: queues[0].id },
                //   ticketId: ticket.id
                // });
                return;
            }
            if (timeUseBotQueues !== "0") {
                //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
                //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
                let dataLimite = new Date();
                let Agora = new Date();
                console.log("log... 1749");
                if (ticketTraking.chatbotAt !== null) {
                    dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + Number(timeUseBotQueues));
                    console.log("log... 1754");
                    if (ticketTraking.chatbotAt !== null &&
                        Agora < dataLimite &&
                        timeUseBotQueues !== "0" &&
                        ticket.amountUsedBotQueues !== 0) {
                        return;
                    }
                }
                await ticketTraking.update({
                    chatbotAt: null
                });
            }
            // if (wbot.waitForSocketOpen()) {
            //   console.log("AGUARDANDO")
            //   console.log(wbot.waitForSocketOpen())
            // }
            wbot.presenceSubscribe(contact.remoteJid);
            let options = "";
            wbot.sendPresenceUpdate("composing", contact.remoteJid);
            console.log("============= queue menu =============");
            queues.forEach((queue, index) => {
                options += `*[ ${index + 1} ]* - ${queue.name}\n`;
            });
            options += `\n*[ Sair ]* - Encerrar atendimento`;
            const body = (0, Mustache_1.default)(`\u200e${greetingMessage}\n\n${options}`, ticket);
            await (0, CreateLogTicketService_1.default)({
                ticketId: ticket.id,
                type: "chatBot"
            });
            await (0, baileys_1.delay)(1000);
            await wbot.sendPresenceUpdate("paused", contact.remoteJid);
            if (ticket.whatsapp.greetingMediaAttachment !== null) {
                console.log("log... 1799");
                const filePath = path_1.default.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);
                const fileExists = fs_2.default.existsSync(filePath);
                // console.log(fileExists);
                if (fileExists) {
                    const messagePath = ticket.whatsapp.greetingMediaAttachment;
                    const optionsMsg = await (0, SendWhatsAppMedia_1.getMessageOptions)(messagePath, filePath, String(companyId), body);
                    console.log("log... 1809");
                    const debouncedSentgreetingMediaAttachment = (0, Debounce_1.debounce)(async () => {
                        let sentMessage = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, { ...optionsMsg });
                        await (0, exports.verifyMediaMessage)(sentMessage, ticket, contact, ticketTraking, false, false, wbot);
                    }, 1000, ticket.id);
                    debouncedSentgreetingMediaAttachment();
                }
                else {
                    console.log("log... 1824");
                    const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
                        const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                            text: body
                        });
                        await (0, exports.verifyMessage)(sentMessage, ticket, contact, ticketTraking);
                    }, 1000, ticket.id);
                    debouncedSentMessage();
                }
                console.log("log... 1843");
                await (0, UpdateTicketService_1.default)({
                    ticketData: {
                    // amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                    },
                    ticketId: ticket.id,
                    companyId
                });
                return;
            }
            else {
                console.log("log... 1854");
                const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
                    const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                        text: body
                    });
                    await (0, exports.verifyMessage)(sentMessage, ticket, contact, ticketTraking);
                }, 1000, ticket.id);
                await (0, UpdateTicketService_1.default)({
                    ticketData: {},
                    ticketId: ticket.id,
                    companyId
                });
                debouncedSentMessage();
            }
        }
    };
    const botList = async () => {
        console.log("log... 1449");
        if (choosenQueue || (queues.length === 1 && chatbot)) {
            console.log("log... 1452");
            // console.log("entrou no choose", ticket.isOutOfHour, ticketTraking.chatbotAt)
            if (queues.length === 1)
                choosenQueue = queues[0];
            const queue = await Queue_1.default.findByPk(choosenQueue.id);
            console.log("log... 1457");
            if (ticket.isOutOfHour === false && ticketTraking.chatbotAt !== null) {
                console.log("log... 1460");
                await ticketTraking.update({
                    chatbotAt: null
                });
                await ticket.update({
                    amountUsedBotQueues: 0
                });
            }
            let currentSchedule;
            if (settings?.scheduleType === "queue") {
                console.log("log... 1472");
                currentSchedule = await (0, VerifyCurrentSchedule_1.default)(companyId, queue.id, 0);
            }
            if (settings?.scheduleType === "queue" && ticket.status !== "open" &&
                !(0, lodash_1.isNil)(currentSchedule) && (ticket.amountUsedBotQueues < maxUseBotQueues || maxUseBotQueues === 0)
                && (!currentSchedule || currentSchedule.inActivity === false)
                && (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")) {
                if (timeUseBotQueues !== "0") {
                    console.log("log... 1483");
                    //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
                    //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
                    let dataLimite = new Date();
                    let Agora = new Date();
                    if (ticketTraking.chatbotAt !== null) {
                        console.log("log... 1491");
                        dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));
                        if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
                            return;
                        }
                    }
                    await ticketTraking.update({
                        chatbotAt: null
                    });
                }
                const outOfHoursMessage = queue.outOfHoursMessage;
                if (outOfHoursMessage !== "") {
                    // console.log("entrei3");
                    const body = (0, Mustache_1.default)(`${outOfHoursMessage}`, ticket);
                    console.log("log... 1509");
                    const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
                        await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                            text: body
                        });
                    }, 1000, ticket.id);
                    debouncedSentMessage();
                    //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
                    // await ticket.update({
                    //   queueId: queue.id,
                    //   isOutOfHour: true,
                    //   amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                    // });
                    // return;
                }
                //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
                await ticket.update({
                    queueId: queue.id,
                    isOutOfHour: true,
                    amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                });
                return;
            }
            await (0, UpdateTicketService_1.default)({
                ticketData: {
                    // amountUsedBotQueues: 0, 
                    queueId: choosenQueue.id
                },
                // ticketData: { queueId: queues.length ===1 ? null : choosenQueue.id },
                ticketId: ticket.id,
                companyId
            });
            // }
            if (choosenQueue.chatbots.length > 0 && !ticket.isGroup) {
                console.log("log... 1554");
                const sectionsRows = [];
                choosenQueue.chatbots.forEach((chatbot, index) => {
                    sectionsRows.push({
                        title: chatbot.name,
                        rowId: `${index + 1}`
                    });
                });
                sectionsRows.push({
                    title: "Voltar Menu Inicial",
                    rowId: "#"
                });
                const sections = [
                    {
                        title: 'Lista de Botões',
                        rows: sectionsRows
                    }
                ];
                const listMessage = {
                    text: (0, Mustache_1.default)(`\u200e${queue.greetingMessage}\n`),
                    title: "Lista\n",
                    buttonText: "Clique aqui",
                    //footer: ".",
                    //listType: 2,
                    sections
                };
                const sendMsg = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, listMessage);
                await (0, exports.verifyMessage)(sendMsg, ticket, contact, ticketTraking);
                if (settings?.settingsUserRandom === "enabled") {
                    console.log("log... 1576");
                    await (0, UpdateTicketService_1.default)({
                        ticketData: { userId: randomUserId },
                        ticketId: ticket.id,
                        companyId
                    });
                }
            }
            if (!choosenQueue.chatbots.length && choosenQueue.greetingMessage.length !== 0) {
                console.log("log... 1586");
                console.log(choosenQueue.greetingMessage);
                const body = (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, ticket);
                const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
                await (0, exports.verifyMessage)(sentMessage, ticket, contact, ticketTraking);
            }
            if (!(0, lodash_1.isNil)(choosenQueue.fileListId)) {
                try {
                    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
                    const files = await (0, ShowService_1.default)(choosenQueue.fileListId, ticket.companyId);
                    const folder = path_1.default.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id));
                    for (const [index, file] of files.options.entries()) {
                        const mediaSrc = {
                            fieldname: 'medias',
                            originalname: file.path,
                            encoding: '7bit',
                            mimetype: file.mediaType,
                            filename: file.path,
                            path: path_1.default.resolve(folder, file.path),
                        };
                        // const debouncedSentMessagePosicao = debounce(
                        //   async () => {
                        const sentMessage = await (0, SendWhatsAppMedia_1.default)({ media: mediaSrc, ticket, body: `\u200e ${file.name}`, isPrivate: false, isForwarded: false });
                        await (0, exports.verifyMediaMessage)(sentMessage, ticket, ticket.contact, ticketTraking, false, false, wbot);
                        //   },
                        //   2000,
                        //   ticket.id
                        // );
                        // debouncedSentMessagePosicao();
                    }
                    ;
                }
                catch (error) {
                    logger_1.default.info(error);
                }
            }
            await (0, baileys_1.delay)(4000);
            //se fila está parametrizada para encerrar ticket automaticamente
            if (choosenQueue.closeTicket) {
                try {
                    await (0, UpdateTicketService_1.default)({
                        ticketData: {
                            status: "closed",
                            queueId: choosenQueue.id,
                            // sendFarewellMessage: false,
                        },
                        ticketId: ticket.id,
                        companyId,
                    });
                }
                catch (error) {
                    logger_1.default.info(error);
                }
                return;
            }
            const count = await Ticket_1.default.findAndCountAll({
                where: {
                    userId: null,
                    status: "pending",
                    companyId,
                    queueId: choosenQueue.id,
                    whatsappId: wbot.id,
                    isGroup: false
                }
            });
            console.log("======== choose queue ========");
            await (0, CreateLogTicketService_1.default)({
                ticketId: ticket.id,
                type: "queue",
                queueId: choosenQueue.id
            });
            if (enableQueuePosition && !choosenQueue.chatbots.length) {
                // Lógica para enviar posição da fila de atendimento
                const qtd = count.count === 0 ? 1 : count.count;
                const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;
                // const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
                const bodyFila = (0, Mustache_1.default)(`${msgFila}`, ticket);
                const debouncedSentMessagePosicao = (0, Debounce_1.debounce)(async () => {
                    await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                        text: bodyFila
                    });
                }, 3000, ticket.id);
                debouncedSentMessagePosicao();
            }
        }
        else {
            if (ticket.isGroup)
                return;
            if (maxUseBotQueues && maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= maxUseBotQueues) {
                // await UpdateTicketService({
                //   ticketData: { queueId: queues[0].id },
                //   ticketId: ticket.id
                // });
                return;
            }
            if (timeUseBotQueues !== "0") {
                //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
                //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
                let dataLimite = new Date();
                let Agora = new Date();
                console.log("log... 1749");
                if (ticketTraking.chatbotAt !== null) {
                    dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));
                    console.log("log... 1754");
                    if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
                        return;
                    }
                }
                await ticketTraking.update({
                    chatbotAt: null
                });
            }
            // if (wbot.waitForSocketOpen()) {
            //   console.log("AGUARDANDO")
            //   console.log(wbot.waitForSocketOpen())
            // }
            wbot.presenceSubscribe(contact.remoteJid);
            let options = "";
            wbot.sendPresenceUpdate("composing", contact.remoteJid);
            console.log("============= queue menu =============");
            const sectionsRows = [];
            queues.forEach((queue, index) => {
                sectionsRows.push({
                    title: `${queue.name}`,
                    description: `_`,
                    rowId: `${index + 1}`
                });
            });
            sectionsRows.push({
                title: "Voltar Menu Inicial",
                rowId: "#"
            });
            await (0, CreateLogTicketService_1.default)({
                ticketId: ticket.id,
                type: "chatBot"
            });
            await (0, baileys_1.delay)(1000);
            const body = (0, Mustache_1.default)(`\u200e${greetingMessage}\n\n${options}`, ticket);
            await wbot.sendPresenceUpdate('paused', contact.remoteJid);
            if (ticket.whatsapp.greetingMediaAttachment !== null) {
                console.log("log... 1799");
                const filePath = path_1.default.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);
                const fileExists = fs_2.default.existsSync(filePath);
                // console.log(fileExists);
                if (fileExists) {
                    const messagePath = ticket.whatsapp.greetingMediaAttachment;
                    const optionsMsg = await (0, SendWhatsAppMedia_1.getMessageOptions)(messagePath, filePath, String(companyId), body);
                    console.log("log... 1809");
                    const debouncedSentgreetingMediaAttachment = (0, Debounce_1.debounce)(async () => {
                        let sentMessage = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, { ...optionsMsg });
                        await (0, exports.verifyMediaMessage)(sentMessage, ticket, contact, ticketTraking, false, false, wbot);
                    }, 1000, ticket.id);
                    debouncedSentgreetingMediaAttachment();
                }
                else {
                    console.log("log... 1824");
                    const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
                        const sections = [
                            {
                                title: 'Lista de Botões',
                                rows: sectionsRows
                            }
                        ];
                        const listMessage = {
                            title: "Lista\n",
                            text: (0, Mustache_1.default)(`\u200e${greetingMessage}\n`),
                            buttonText: "Clique aqui",
                            //footer: "_",
                            sections
                        };
                        const sendMsg = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, listMessage);
                        await (0, exports.verifyMessage)(sendMsg, ticket, contact, ticketTraking);
                    }, 1000, ticket.id);
                    debouncedSentMessage();
                }
                console.log("log... 1843");
                await (0, UpdateTicketService_1.default)({
                    ticketData: {
                    // amountUsedBotQueues: ticket.amountUsedBotQueues + 1 
                    },
                    ticketId: ticket.id,
                    companyId
                });
                return;
            }
            else {
                console.log("log... 1854 - Lista");
                const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
                    const sections = [
                        {
                            title: 'Lista de Botões',
                            rows: sectionsRows
                        }
                    ];
                    const listMessage = {
                        title: "Lista\n",
                        text: (0, Mustache_1.default)(`\u200e${greetingMessage}\n`),
                        buttonText: "Clique aqui",
                        //footer: "_",
                        sections
                    };
                    const sendMsg = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, listMessage);
                    await (0, exports.verifyMessage)(sendMsg, ticket, contact, ticketTraking);
                }, 1000, ticket.id);
                await (0, UpdateTicketService_1.default)({
                    ticketData: {},
                    ticketId: ticket.id,
                    companyId
                });
                debouncedSentMessage();
            }
        }
    };
    const botButton = async () => {
        console.log("log... 1449");
        if (choosenQueue || (queues.length === 1 && chatbot)) {
            console.log("log... 1452");
            // console.log("entrou no choose", ticket.isOutOfHour, ticketTraking.chatbotAt)
            if (queues.length === 1)
                choosenQueue = queues[0];
            const queue = await Queue_1.default.findByPk(choosenQueue.id);
            console.log("log... 1457");
            if (ticket.isOutOfHour === false && ticketTraking.chatbotAt !== null) {
                console.log("log... 1460");
                await ticketTraking.update({
                    chatbotAt: null
                });
                await ticket.update({
                    amountUsedBotQueues: 0
                });
            }
            let currentSchedule;
            if (settings?.scheduleType === "queue") {
                console.log("log... 1472");
                currentSchedule = await (0, VerifyCurrentSchedule_1.default)(companyId, queue.id, 0);
            }
            if (settings?.scheduleType === "queue" && ticket.status !== "open" &&
                !(0, lodash_1.isNil)(currentSchedule) && (ticket.amountUsedBotQueues < maxUseBotQueues || maxUseBotQueues === 0)
                && (!currentSchedule || currentSchedule.inActivity === false)
                && (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")) {
                if (timeUseBotQueues !== "0") {
                    console.log("log... 1483");
                    //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
                    //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
                    let dataLimite = new Date();
                    let Agora = new Date();
                    if (ticketTraking.chatbotAt !== null) {
                        console.log("log... 1491");
                        dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));
                        if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
                            return;
                        }
                    }
                    await ticketTraking.update({
                        chatbotAt: null
                    });
                }
                const outOfHoursMessage = queue.outOfHoursMessage;
                if (outOfHoursMessage !== "") {
                    // console.log("entrei3");
                    const body = (0, Mustache_1.default)(`${outOfHoursMessage}`, ticket);
                    console.log("log... 1509");
                    const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
                        await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                            text: body
                        });
                    }, 1000, ticket.id);
                    debouncedSentMessage();
                }
                await ticket.update({
                    queueId: queue.id,
                    isOutOfHour: true,
                    amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                });
                return;
            }
            await (0, UpdateTicketService_1.default)({
                ticketData: {
                    queueId: choosenQueue.id
                },
                ticketId: ticket.id,
                companyId
            });
            // }
            if (choosenQueue.chatbots.length > 0 && !ticket.isGroup) {
                console.log("log... 1554");
                const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
                    try {
                        console.log("log... enviando as opcoes das filas");
                        // Busca o número do WhatsApp associado ao ticket
                        const whatsapp = await Whatsapp_1.default.findOne({ where: { id: ticket.whatsappId } });
                        if (!whatsapp || !whatsapp.number) {
                            console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
                            throw new Error('Número de WhatsApp não encontrado');
                        }
                        const botNumber = whatsapp.number;
                        const buttons = [];
                        // Adiciona os chatbots como botões
                        choosenQueue.chatbots.forEach((chatbot, index) => {
                            buttons.push({
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: chatbot.name,
                                    id: `${index + 1}`
                                })
                            });
                        });
                        buttons.push({
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: "Voltar Menu Inicial",
                                id: "#"
                            })
                        });
                        const interactiveMsg = {
                            viewOnceMessage: {
                                message: {
                                    interactiveMessage: {
                                        body: {
                                            text: `\u200e${choosenQueue.greetingMessage}`,
                                        },
                                        nativeFlowMessage: {
                                            buttons: buttons,
                                            messageParamsJson: JSON.stringify({
                                                from: 'apiv2',
                                                templateId: '4194019344155670',
                                            }),
                                        },
                                    },
                                },
                            },
                        };
                        const jid = `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`;
                        const newMsg = (0, baileys_1.generateWAMessageFromContent)(jid, interactiveMsg, { userJid: botNumber, });
                        await wbot.relayMessage(jid, newMsg.message, { messageId: newMsg.key.id });
                        if (newMsg) {
                            await wbot.upsertMessage(newMsg, 'notify');
                        }
                    }
                    catch (error) {
                        console.error('Erro ao enviar ou fazer upsert da mensagem:', error);
                    }
                }, 1000, ticket.id);
                debouncedSentMessage();
                if (settings?.settingsUserRandom === "enabled") {
                    console.log("log... 1576");
                    await (0, UpdateTicketService_1.default)({
                        ticketData: { userId: randomUserId },
                        ticketId: ticket.id,
                        companyId
                    });
                }
            }
            if (!choosenQueue.chatbots.length && choosenQueue.greetingMessage.length !== 0) {
                console.log("log... 1586");
                console.log(choosenQueue.greetingMessage);
                const body = (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, ticket);
                const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
                await (0, exports.verifyMessage)(sentMessage, ticket, contact, ticketTraking);
            }
            if (!(0, lodash_1.isNil)(choosenQueue.fileListId)) {
                try {
                    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
                    const files = await (0, ShowService_1.default)(choosenQueue.fileListId, ticket.companyId);
                    const folder = path_1.default.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id));
                    for (const [index, file] of files.options.entries()) {
                        const mediaSrc = {
                            fieldname: 'medias',
                            originalname: file.path,
                            encoding: '7bit',
                            mimetype: file.mediaType,
                            filename: file.path,
                            path: path_1.default.resolve(folder, file.path),
                        };
                        // const debouncedSentMessagePosicao = debounce(
                        //   async () => {
                        const sentMessage = await (0, SendWhatsAppMedia_1.default)({ media: mediaSrc, ticket, body: `\u200e ${file.name}`, isPrivate: false, isForwarded: false });
                        await (0, exports.verifyMediaMessage)(sentMessage, ticket, ticket.contact, ticketTraking, false, false, wbot);
                        //   },
                        //   2000,
                        //   ticket.id
                        // );
                        // debouncedSentMessagePosicao();
                    }
                    ;
                }
                catch (error) {
                    logger_1.default.info(error);
                }
            }
            await (0, baileys_1.delay)(4000);
            //se fila está parametrizada para encerrar ticket automaticamente
            if (choosenQueue.closeTicket) {
                try {
                    await (0, UpdateTicketService_1.default)({
                        ticketData: {
                            status: "closed",
                            queueId: choosenQueue.id,
                            // sendFarewellMessage: false,
                        },
                        ticketId: ticket.id,
                        companyId,
                    });
                }
                catch (error) {
                    logger_1.default.info(error);
                }
                return;
            }
            const count = await Ticket_1.default.findAndCountAll({
                where: {
                    userId: null,
                    status: "pending",
                    companyId,
                    queueId: choosenQueue.id,
                    whatsappId: wbot.id,
                    isGroup: false
                }
            });
            console.log("======== choose queue ========");
            await (0, CreateLogTicketService_1.default)({
                ticketId: ticket.id,
                type: "queue",
                queueId: choosenQueue.id
            });
            if (enableQueuePosition && !choosenQueue.chatbots.length) {
                // Lógica para enviar posição da fila de atendimento
                const qtd = count.count === 0 ? 1 : count.count;
                const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;
                // const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
                const bodyFila = (0, Mustache_1.default)(`${msgFila}`, ticket);
                const debouncedSentMessagePosicao = (0, Debounce_1.debounce)(async () => {
                    await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                        text: bodyFila
                    });
                }, 3000, ticket.id);
                debouncedSentMessagePosicao();
            }
        }
        else {
            if (ticket.isGroup)
                return;
            if (maxUseBotQueues && maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= maxUseBotQueues) {
                // await UpdateTicketService({
                //   ticketData: { queueId: queues[0].id },
                //   ticketId: ticket.id
                // });
                return;
            }
            if (timeUseBotQueues !== "0") {
                //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
                //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
                let dataLimite = new Date();
                let Agora = new Date();
                console.log("log... 1749");
                if (ticketTraking.chatbotAt !== null) {
                    dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));
                    console.log("log... 1754");
                    if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
                        return;
                    }
                }
                await ticketTraking.update({
                    chatbotAt: null
                });
            }
            wbot.presenceSubscribe(contact.remoteJid);
            let options = "";
            wbot.sendPresenceUpdate("composing", contact.remoteJid);
            console.log("============= queue menu =============");
            const body = (0, Mustache_1.default)(`\u200e${greetingMessage}\n\n${options}`, ticket);
            await (0, CreateLogTicketService_1.default)({
                ticketId: ticket.id,
                type: "chatBot"
            });
            await (0, baileys_1.delay)(1000);
            await wbot.sendPresenceUpdate('paused', contact.remoteJid);
            if (ticket.whatsapp.greetingMediaAttachment !== null) {
                console.log("log... 1799");
                const filePath = path_1.default.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);
                const fileExists = fs_2.default.existsSync(filePath);
                // console.log(fileExists);
                if (fileExists) {
                    console.log("log... botao com midia");
                    const debouncedSentgreetingMediaAttachment = (0, Debounce_1.debounce)(async () => {
                        try {
                            const whatsapp = await Whatsapp_1.default.findOne({ where: { id: ticket.whatsappId } });
                            if (!whatsapp || !whatsapp.number) {
                                console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
                                throw new Error('Número de WhatsApp não encontrado');
                            }
                            const botNumber = whatsapp.number;
                            const buttons = [];
                            queues.forEach((queue, index) => {
                                buttons.push({
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: queue.name,
                                        id: `${index + 1}`
                                    }),
                                });
                            });
                            buttons.push({
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: "Encerrar atendimento",
                                    id: "Sair"
                                }),
                            });
                            // Verifica se há uma mídia para enviar
                            if (ticket.whatsapp.greetingMediaAttachment) {
                                const filePath = path_1.default.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);
                                const fileExists = fs_2.default.existsSync(filePath);
                                if (fileExists) {
                                    // Carrega a imagem local
                                    const imageMessageContent = await (0, baileys_1.generateWAMessageContent)({ image: { url: filePath } }, // Caminho da imagem local
                                    { upload: wbot.waUploadToServer });
                                    const imageMessage = imageMessageContent.imageMessage;
                                    // Mensagem interativa com mídia
                                    const interactiveMsg = {
                                        viewOnceMessage: {
                                            message: {
                                                interactiveMessage: {
                                                    body: {
                                                        text: `\u200e${greetingMessage}`,
                                                    },
                                                    header: {
                                                        imageMessage,
                                                        hasMediaAttachment: true
                                                    },
                                                    nativeFlowMessage: {
                                                        buttons: buttons,
                                                        messageParamsJson: JSON.stringify({
                                                            from: 'apiv2',
                                                            templateId: '4194019344155670',
                                                        }),
                                                    },
                                                },
                                            },
                                        },
                                    };
                                    const jid = `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`;
                                    const newMsg = (0, baileys_1.generateWAMessageFromContent)(jid, interactiveMsg, { userJid: botNumber });
                                    await wbot.relayMessage(jid, newMsg.message, { messageId: newMsg.key.id });
                                    if (newMsg) {
                                        await wbot.upsertMessage(newMsg, 'notify');
                                    }
                                }
                            }
                        }
                        catch (error) {
                            console.error('Erro ao enviar ou fazer upsert da mensagem:', error);
                        }
                    }, 1000, ticket.id);
                    debouncedSentgreetingMediaAttachment();
                }
                else {
                    console.log("log... Botao sem midia");
                    const debouncedSentButton = (0, Debounce_1.debounce)(async () => {
                        try {
                            const whatsapp = await Whatsapp_1.default.findOne({ where: { id: ticket.whatsappId } });
                            if (!whatsapp || !whatsapp.number) {
                                console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
                                throw new Error('Número de WhatsApp não encontrado');
                            }
                            const botNumber = whatsapp.number;
                            const buttons = [];
                            queues.forEach((queue, index) => {
                                buttons.push({
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: queue.name,
                                        id: `${index + 1}`
                                    }),
                                });
                            });
                            buttons.push({
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: "Encerrar atendimento",
                                    id: "Sair"
                                }),
                            });
                            const interactiveMsg = {
                                viewOnceMessage: {
                                    message: {
                                        interactiveMessage: {
                                            body: {
                                                text: `\u200e${greetingMessage}`,
                                            },
                                            nativeFlowMessage: {
                                                buttons: buttons,
                                                messageParamsJson: JSON.stringify({
                                                    from: 'apiv2',
                                                    templateId: '4194019344155670',
                                                }),
                                            },
                                        },
                                    },
                                },
                            };
                            const jid = `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`;
                            const newMsg = (0, baileys_1.generateWAMessageFromContent)(jid, interactiveMsg, { userJid: botNumber });
                            await wbot.relayMessage(jid, newMsg.message, { messageId: newMsg.key.id });
                            if (newMsg) {
                                await wbot.upsertMessage(newMsg, 'notify');
                            }
                        }
                        catch (error) {
                            console.error('Erro ao enviar ou fazer upsert da mensagem:', error);
                        }
                    }, 1000, ticket.id);
                    debouncedSentButton();
                }
                console.log("log... 1843");
                await (0, UpdateTicketService_1.default)({
                    ticketData: {},
                    ticketId: ticket.id,
                    companyId
                });
                return;
            }
            else {
                console.log("log... 1854 - botao");
                const debouncedSentButton = (0, Debounce_1.debounce)(async () => {
                    try {
                        const whatsapp = await Whatsapp_1.default.findOne({ where: { id: ticket.whatsappId } });
                        if (!whatsapp || !whatsapp.number) {
                            console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
                            throw new Error('Número de WhatsApp não encontrado');
                        }
                        const botNumber = whatsapp.number;
                        const buttons = [];
                        queues.forEach((queue, index) => {
                            buttons.push({
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({
                                    display_text: queue.name,
                                    id: `${index + 1}`
                                }),
                            });
                        });
                        buttons.push({
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: "Encerrar atendimento",
                                id: "Sair"
                            }),
                        });
                        const interactiveMsg = {
                            viewOnceMessage: {
                                message: {
                                    interactiveMessage: {
                                        body: {
                                            text: `\u200e${greetingMessage}`,
                                        },
                                        nativeFlowMessage: {
                                            buttons: buttons,
                                            messageParamsJson: JSON.stringify({
                                                from: 'apiv2',
                                                templateId: '4194019344155670',
                                            }),
                                        },
                                    },
                                },
                            },
                        };
                        const jid = `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`;
                        const newMsg = (0, baileys_1.generateWAMessageFromContent)(jid, interactiveMsg, { userJid: botNumber });
                        await wbot.relayMessage(jid, newMsg.message, { messageId: newMsg.key.id });
                        if (newMsg) {
                            await wbot.upsertMessage(newMsg, 'notify');
                        }
                    }
                    catch (error) {
                        console.error('Erro ao enviar ou fazer upsert da mensagem:', error);
                    }
                }, 1000, ticket.id);
                await (0, UpdateTicketService_1.default)({
                    ticketData: {},
                    ticketId: ticket.id,
                    companyId
                });
                debouncedSentButton();
            }
        }
    };
    if (typeBot === "text") {
        return botText();
    }
    if (typeBot === "list") {
        return botList();
    }
    if (typeBot === "button") {
        return botButton();
    }
    if (typeBot === "button" && queues.length > 3) {
        return botText();
    }
};
const verifyRating = (ticketTraking) => {
    console.log("2029", { verifyRating: exports.verifyRating });
    if (ticketTraking &&
        ticketTraking.finishedAt === null &&
        ticketTraking.closedAt !== null &&
        ticketTraking.userId !== null &&
        ticketTraking.ratingAt === null) {
        return true;
    }
    return false;
};
exports.verifyRating = verifyRating;
const handleRating = async (rate, ticket, ticketTraking) => {
    const io = (0, socket_1.getIO)();
    const companyId = ticket.companyId;
    console.log("2050", { handleRating: exports.handleRating });
    // console.log("GETTING WHATSAPP HANDLE RATING", ticket.whatsappId, ticket.id)
    const { complationMessage } = await (0, ShowWhatsAppService_1.default)(ticket.whatsappId, companyId);
    let finalRate = rate;
    if (rate < 0) {
        finalRate = 0;
    }
    if (rate > 10) {
        finalRate = 10;
    }
    await UserRating_1.default.create({
        ticketId: ticketTraking.ticketId,
        companyId: ticketTraking.companyId,
        userId: ticketTraking.userId,
        rate: finalRate
    });
    if (!(0, lodash_1.isNil)(complationMessage) &&
        complationMessage !== "" &&
        !ticket.isGroup) {
        const body = (0, Mustache_1.default)(`\u200e${complationMessage}`, ticket);
        if (ticket.channel === "whatsapp") {
            const msg = await (0, SendWhatsAppMessage_1.default)({ body, ticket });
            await (0, exports.verifyMessage)(msg, ticket, ticket.contact, ticketTraking);
        }
        if (["facebook", "instagram"].includes(ticket.channel)) {
            await (0, sendFacebookMessage_1.default)({ body, ticket });
        }
    }
    await ticket.update({
        isBot: false,
        status: "closed",
        amountUsedBotQueuesNPS: 0
    });
    //loga fim de atendimento
    await (0, CreateLogTicketService_1.default)({
        userId: ticket.userId,
        queueId: ticket.queueId,
        ticketId: ticket.id,
        type: "closed"
    });
    io.of(String(companyId))
        // .to("open")
        .emit(`company-${companyId}-ticket`, {
        action: "delete",
        ticket,
        ticketId: ticket.id
    });
    io.of(String(companyId))
        // .to(ticket.status)
        // .to(ticket.id.toString())
        .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
    });
};
exports.handleRating = handleRating;
const sanitizeName = (name) => {
    let sanitized = name.split(" ")[0];
    sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
    return sanitized.substring(0, 60);
};
const deleteFileSync = (path) => {
    try {
        fs_2.default.unlinkSync(path);
    }
    catch (error) {
        console.error("Erro ao deletar o arquivo:", error);
    }
};
const convertTextToSpeechAndSaveToFile = (text, filename, subscriptionKey, serviceRegion, voice = "pt-BR-FabioNeural", audioToFormat = "mp3") => {
    return new Promise((resolve, reject) => {
        const speechConfig = microsoft_cognitiveservices_speech_sdk_1.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
        speechConfig.speechSynthesisVoiceName = voice;
        const audioConfig = microsoft_cognitiveservices_speech_sdk_1.AudioConfig.fromAudioFileOutput(`${filename}.wav`);
        const synthesizer = new microsoft_cognitiveservices_speech_sdk_1.SpeechSynthesizer(speechConfig, audioConfig);
        synthesizer.speakTextAsync(text, result => {
            if (result) {
                convertWavToAnotherFormat(`${filename}.wav`, `${filename}.${audioToFormat}`, audioToFormat)
                    .then(output => {
                    resolve();
                })
                    .catch(error => {
                    console.error(error);
                    reject(error);
                });
            }
            else {
                reject(new Error("No result from synthesizer"));
            }
            synthesizer.close();
        }, error => {
            console.error(`Error: ${error}`);
            synthesizer.close();
            reject(error);
        });
    });
};
exports.convertTextToSpeechAndSaveToFile = convertTextToSpeechAndSaveToFile;
const convertWavToAnotherFormat = (inputPath, outputPath, toFormat) => {
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)()
            .input(inputPath)
            .toFormat(toFormat)
            .on("end", () => resolve(outputPath))
            .on("error", (err) => reject(new Error(`Error converting file: ${err.message}`)))
            .save(outputPath);
    });
};
const keepOnlySpecifiedChars = (str) => {
    return str.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚâêîôûÂÊÎÔÛãõÃÕçÇ!?.,;:\s]/g, "");
};
exports.keepOnlySpecifiedChars = keepOnlySpecifiedChars;
const transferQueue = async (queueId, ticket, contact) => {
    await (0, UpdateTicketService_1.default)({
        ticketData: { queueId: queueId },
        ticketId: ticket.id,
        companyId: ticket.companyId
    });
};
exports.transferQueue = transferQueue;
const flowbuilderIntegration = async (msg, wbot, companyId, queueIntegration, ticket, contact, isFirstMsg, isTranfered) => {
    const io = (0, socket_1.getIO)();
    const quotedMsg = await verifyQuotedMessage(msg);
    const body = (0, exports.getBodyMessage)(msg);
    /*
    const messageData = {
      wid: msg.key.id,
      ticketId: ticket.id,
      contactId: msg.key.fromMe ? undefined : contact.id,
      body: body,
      fromMe: msg.key.fromMe,
      read: msg.key.fromMe,
      quotedMsgId: quotedMsg?.id,
      ack: Number(String(msg.status).replace('PENDING', '2').replace('NaN', '1')) || 2,
      remoteJid: msg.key.remoteJid,
      participant: msg.key.participant,
      dataJson: JSON.stringify(msg),
      createdAt: new Date(
        Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)
      ).toISOString(),
      ticketImported: ticket.imported,
    };
  
  
    await CreateMessageService({ messageData, companyId: ticket.companyId });
  
    */
    if (!msg.key.fromMe && ticket.status === "closed") {
        console.log("===== CHANGE =====");
        await ticket.update({ status: "pending" });
        await ticket.reload({
            include: [
                { model: Queue_1.default, as: "queue" },
                { model: User_1.default, as: "user" },
                { model: Contact_1.default, as: "contact" }
            ]
        });
        await (0, UpdateTicketService_1.default)({
            ticketData: { status: "pending", integrationId: ticket.integrationId },
            ticketId: ticket.id,
            companyId
        });
        io.of(String(companyId)).emit(`company-${companyId}-ticket`, {
            action: "delete",
            ticket,
            ticketId: ticket.id
        });
        io.to(ticket.status).emit(`company-${companyId}-ticket`, {
            action: "update",
            ticket,
            ticketId: ticket.id
        });
    }
    if (msg.key.fromMe) {
        return;
    }
    const whatsapp = await (0, ShowWhatsAppService_1.default)(wbot.id, companyId);
    const listPhrase = await FlowCampaign_1.FlowCampaignModel.findAll({
        where: {
            whatsappId: whatsapp.id
        }
    });
    if (!isFirstMsg &&
        listPhrase.filter(item => item.phrase === body).length === 0) {
        const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
            where: {
                id: whatsapp.flowIdWelcome
            }
        });
        if (flow) {
            const nodes = flow.flow["nodes"];
            const connections = flow.flow["connections"];
            const mountDataContact = {
                number: contact.number,
                name: contact.name,
                email: contact.email
            };
            // const worker = new Worker("./src/services/WebhookService/WorkerAction.ts");
            // // Enviar as variáveis como parte da mensagem para o Worker
            // console.log('DISPARO1')
            // const data = {
            //   idFlowDb: flowUse.flowIdWelcome,
            //   companyId: ticketUpdate.companyId,
            //   nodes: nodes,
            //   connects: connections,
            //   nextStage: flow.flow["nodes"][0].id,
            //   dataWebhook: null,
            //   details: "",
            //   hashWebhookId: "",
            //   pressKey: null,
            //   idTicket: ticketUpdate.id,
            //   numberPhrase: mountDataContact
            // };
            // worker.postMessage(data);
            // worker.on("message", message => {
            //   console.log(`Mensagem do worker: ${message}`);
            // });
            await (0, ActionsWebhookService_1.ActionsWebhookService)(whatsapp.id, whatsapp.flowIdWelcome, ticket.companyId, nodes, connections, flow.flow["nodes"][0].id, null, "", "", null, ticket.id, mountDataContact, msg);
        }
    }
    const dateTicket = new Date(isFirstMsg?.updatedAt ? isFirstMsg.updatedAt : "");
    const dateNow = new Date();
    const diferencaEmMilissegundos = Math.abs((0, date_fns_1.differenceInMilliseconds)(dateTicket, dateNow));
    const seisHorasEmMilissegundos = 1000;
    if (listPhrase.filter(item => item.phrase === body).length === 0 &&
        diferencaEmMilissegundos >= seisHorasEmMilissegundos &&
        isFirstMsg) {
        console.log("2427", "handleMessageIntegration");
        const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
            where: {
                id: whatsapp.flowIdNotPhrase
            }
        });
        if (flow) {
            const nodes = flow.flow["nodes"];
            const connections = flow.flow["connections"];
            const mountDataContact = {
                number: contact.number,
                name: contact.name,
                email: contact.email
            };
            await (0, ActionsWebhookService_1.ActionsWebhookService)(whatsapp.id, whatsapp.flowIdNotPhrase, ticket.companyId, nodes, connections, flow.flow["nodes"][0].id, null, "", "", null, ticket.id, mountDataContact, msg);
        }
    }
    // Campaign fluxo
    if (listPhrase.filter(item => item.phrase === body).length !== 0) {
        const flowDispar = listPhrase.filter(item => item.phrase === body)[0];
        const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
            where: {
                id: flowDispar.flowId
            }
        });
        const nodes = flow.flow["nodes"];
        const connections = flow.flow["connections"];
        const mountDataContact = {
            number: contact.number,
            name: contact.name,
            email: contact.email
        };
        //const worker = new Worker("./src/services/WebhookService/WorkerAction.ts");
        //console.log('DISPARO3')
        // Enviar as variáveis como parte da mensagem para o Worker
        // const data = {
        //   idFlowDb: flowDispar.flowId,
        //   companyId: ticketUpdate.companyId,
        //   nodes: nodes,
        //   connects: connections,
        //   nextStage: flow.flow["nodes"][0].id,
        //   dataWebhook: null,
        //   details: "",
        //   hashWebhookId: "",
        //   pressKey: null,
        //   idTicket: ticketUpdate.id,
        //   numberPhrase: mountDataContact
        // };
        // worker.postMessage(data);
        // worker.on("message", message => {
        //   console.log(`Mensagem do worker: ${message}`);
        // });
        await (0, ActionsWebhookService_1.ActionsWebhookService)(whatsapp.id, flowDispar.flowId, ticket.companyId, nodes, connections, flow.flow["nodes"][0].id, null, "", "", null, ticket.id, mountDataContact);
        return;
    }
    if (ticket.flowWebhook) {
        const webhook = await Webhook_1.WebhookModel.findOne({
            where: {
                company_id: ticket.companyId,
                hash_id: ticket.hashFlowId
            }
        });
        if (webhook && webhook.config["details"]) {
            const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
                where: {
                    id: webhook.config["details"].idFlow
                }
            });
            const nodes = flow.flow["nodes"];
            const connections = flow.flow["connections"];
            // const worker = new Worker("./src/services/WebhookService/WorkerAction.ts");
            // console.log('DISPARO4')
            // // Enviar as variáveis como parte da mensagem para o Worker
            // const data = {
            //   idFlowDb: webhook.config["details"].idFlow,
            //   companyId: ticketUpdate.companyId,
            //   nodes: nodes,
            //   connects: connections,
            //   nextStage: ticketUpdate.lastFlowId,
            //   dataWebhook: ticketUpdate.dataWebhook,
            //   details: webhook.config["details"],
            //   hashWebhookId: ticketUpdate.hashFlowId,
            //   pressKey: body,
            //   idTicket: ticketUpdate.id,
            //   numberPhrase: ""
            // };
            // worker.postMessage(data);
            // worker.on("message", message => {
            //   console.log(`Mensagem do worker: ${message}`);
            // });
            await (0, ActionsWebhookService_1.ActionsWebhookService)(whatsapp.id, webhook.config["details"].idFlow, ticket.companyId, nodes, connections, ticket.lastFlowId, ticket.dataWebhook, webhook.config["details"], ticket.hashFlowId, body, ticket.id);
        }
        else {
            const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
                where: {
                    id: ticket.flowStopped
                }
            });
            const nodes = flow.flow["nodes"];
            const connections = flow.flow["connections"];
            if (!ticket.lastFlowId) {
                return;
            }
            const mountDataContact = {
                number: contact.number,
                name: contact.name,
                email: contact.email
            };
            // const worker = new Worker("./src/services/WebhookService/WorkerAction.ts");
            // console.log('DISPARO5')
            // // Enviar as variáveis como parte da mensagem para o Worker
            // const data = {
            //   idFlowDb: parseInt(ticketUpdate.flowStopped),
            //   companyId: ticketUpdate.companyId,
            //   nodes: nodes,
            //   connects: connections,
            //   nextStage: ticketUpdate.lastFlowId,
            //   dataWebhook: null,
            //   details: "",
            //   hashWebhookId: "",
            //   pressKey: body,
            //   idTicket: ticketUpdate.id,
            //   numberPhrase: mountDataContact
            // };
            // worker.postMessage(data);
            // worker.on("message", message => {
            //   console.log(`Mensagem do worker: ${message}`);
            // });
            await (0, ActionsWebhookService_1.ActionsWebhookService)(whatsapp.id, parseInt(ticket.flowStopped), ticket.companyId, nodes, connections, ticket.lastFlowId, null, "", "", body, ticket.id, mountDataContact, msg);
        }
    }
};
const handleMessageIntegration = async (msg, wbot, companyId, queueIntegration, ticket, isMenu, whatsapp, contact, isFirstMsg) => {
    const msgType = getTypeMessage(msg);
    if (queueIntegration.type === "n8n" || queueIntegration.type === "webhook") {
        if (queueIntegration?.urlN8N) {
            const options = {
                method: "POST",
                url: queueIntegration?.urlN8N,
                headers: {
                    "Content-Type": "application/json"
                },
                json: msg
            };
            try {
                request(options, function (error, response) {
                    if (error) {
                        throw new Error(error);
                    }
                    else {
                        console.log(response.body);
                    }
                });
            }
            catch (error) {
                throw new Error(error);
            }
        }
    }
    else if (queueIntegration.type === "dialogflow") {
        let inputAudio;
        if (msgType === "audioMessage") {
            let filename = `${msg.messageTimestamp}.ogg`;
            (0, fs_1.readFile)((0, path_1.join)(__dirname, "..", "..", "..", "public", `company${companyId}`, filename), "base64", (err, data) => {
                inputAudio = data;
                if (err) {
                    logger_1.default.error(err);
                }
            });
        }
        else {
            inputAudio = undefined;
        }
        const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
            await sendDialogflowAwswer(wbot, ticket, msg, ticket.contact, inputAudio, companyId, queueIntegration);
        }, 500, ticket.id);
        debouncedSentMessage();
    }
    else if (queueIntegration.type === "typebot") {
        // await typebots(ticket, msg, wbot, queueIntegration);
        await (0, typebotListener_1.default)({ ticket, msg, wbot, typebot: queueIntegration });
    }
    else if (queueIntegration.type === "flowbuilder") {
        if (!isMenu) {
            const integrations = await (0, ShowQueueIntegrationService_1.default)(whatsapp.integrationId, companyId);
            await flowbuilderIntegration(msg, wbot, companyId, integrations, ticket, contact, isFirstMsg);
        }
        else {
            if (!isNaN(parseInt(ticket.lastMessage)) &&
                ticket.status !== "open" &&
                ticket.status !== "closed") {
                await flowBuilderQueue(ticket, msg, wbot, whatsapp, companyId, contact, isFirstMsg);
            }
        }
    }
};
exports.handleMessageIntegration = handleMessageIntegration;
const flowBuilderQueue = async (ticket, msg, wbot, whatsapp, companyId, contact, isFirstMsg) => {
    const body = (0, exports.getBodyMessage)(msg);
    const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
        where: {
            id: ticket.flowStopped
        }
    });
    const mountDataContact = {
        number: contact.number,
        name: contact.name,
        email: contact.email
    };
    const nodes = flow.flow["nodes"];
    const connections = flow.flow["connections"];
    if (!ticket.lastFlowId) {
        return;
    }
    if (ticket.status === "closed" ||
        ticket.status === "interrupted" ||
        ticket.status === "open") {
        return;
    }
    await (0, ActionsWebhookService_1.ActionsWebhookService)(whatsapp.id, parseInt(ticket.flowStopped), ticket.companyId, nodes, connections, ticket.lastFlowId, null, "", "", body, ticket.id, mountDataContact, msg);
    //const integrations = await ShowQueueIntegrationService(whatsapp.integrationId, companyId);
    //await handleMessageIntegration(msg, wbot, companyId, integrations, ticket, contact, isFirstMsg)
};
const handleMessage = async (msg, wbot, companyId, isImported = false) => {
    console.log("log... 2874");
    if (!isValidMsg(msg)) {
        console.log("log... 2877");
        return;
    }
    try {
        let msgContact;
        let groupContact;
        let queueId = null;
        let tagsId = null;
        let userId = null;
        let bodyMessage = (0, exports.getBodyMessage)(msg);
        const msgType = getTypeMessage(msg);
        console.log("log... 2891");
        const hasMedia = msg.message?.imageMessage ||
            msg.message?.audioMessage ||
            msg.message?.videoMessage ||
            msg.message?.stickerMessage ||
            msg.message?.documentMessage ||
            msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
            // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
            // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
            // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
            msg.message?.ephemeralMessage?.message?.audioMessage ||
            msg.message?.ephemeralMessage?.message?.documentMessage ||
            msg.message?.ephemeralMessage?.message?.videoMessage ||
            msg.message?.ephemeralMessage?.message?.stickerMessage ||
            msg.message?.ephemeralMessage?.message?.imageMessage ||
            msg.message?.viewOnceMessage?.message?.imageMessage ||
            msg.message?.viewOnceMessage?.message?.videoMessage ||
            msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
                ?.imageMessage ||
            msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
                ?.videoMessage ||
            msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
                ?.audioMessage ||
            msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
                ?.documentMessage ||
            msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
            msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
            msg.message?.templateMessage?.hydratedTemplate?.documentMessage ||
            msg.message?.templateMessage?.hydratedTemplate?.videoMessage ||
            msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
            msg.message?.templateMessage?.hydratedFourRowTemplate?.documentMessage ||
            msg.message?.templateMessage?.hydratedFourRowTemplate?.videoMessage ||
            msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
            msg.message?.templateMessage?.fourRowTemplate?.documentMessage ||
            msg.message?.templateMessage?.fourRowTemplate?.videoMessage ||
            msg.message?.interactiveMessage?.header?.imageMessage ||
            msg.message?.interactiveMessage?.header?.documentMessage ||
            msg.message?.interactiveMessage?.header?.videoMessage ||
            msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
                ?.documentMessage ||
            msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
                ?.videoMessage ||
            msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
                ?.imageMessage ||
            msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
                ?.locationMessage;
        if (msg.key.fromMe) {
            if (/\u200e/.test(bodyMessage))
                return;
            console.log("log... 2935");
            if (!hasMedia &&
                msgType !== "conversation" &&
                msgType !== "extendedTextMessage" &&
                msgType !== "contactMessage" &&
                msgType !== "reactionMessage" &&
                msgType !== "ephemeralMessage" &&
                msgType !== "protocolMessage" &&
                msgType !== "viewOnceMessage" &&
                msgType !== "editedMessage" &&
                msgType !== "hydratedContentText")
                return;
            console.log("log... 2950");
            msgContact = await getContactMessage(msg, wbot);
        }
        else {
            console.log("log... 2953");
            msgContact = await getContactMessage(msg, wbot);
        }
        const isGroup = msg.key.remoteJid?.endsWith("@g.us");
        const whatsapp = await (0, ShowWhatsAppService_1.default)(wbot.id, companyId);
        console.log("log... 2961");
        if (!whatsapp.allowGroup && isGroup)
            return;
        if (isGroup) {
            console.log("log... 2966");
            const grupoMeta = await wbot.groupMetadata(msg.key.remoteJid);
            const msgGroupContact = {
                id: grupoMeta.id,
                name: grupoMeta.subject
            };
            groupContact = await verifyContact(msgGroupContact, wbot, companyId);
        }
        const contact = await verifyContact(msgContact, wbot, companyId);
        let unreadMessages = 0;
        if (msg.key.fromMe) {
            console.log("log... 2980");
            await cache_1.default.set(`contacts:${contact.id}:unreads`, "0");
        }
        else {
            console.log("log... 2983");
            const unreads = await cache_1.default.get(`contacts:${contact.id}:unreads`);
            unreadMessages = +unreads + 1;
            await cache_1.default.set(`contacts:${contact.id}:unreads`, `${unreadMessages}`);
        }
        const settings = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        });
        const enableLGPD = settings.enableLGPD === "enabled";
        const isFirstMsg = await Ticket_1.default.findOne({
            where: {
                contactId: groupContact ? groupContact.id : contact.id,
                companyId,
                whatsappId: whatsapp.id
            },
            order: [["id", "DESC"]]
        });
        const mutex = new async_mutex_1.Mutex();
        // Inclui a busca de ticket aqui, se realmente não achar um ticket, então vai para o findorcreate
        const ticket = await mutex.runExclusive(async () => {
            const result = await (0, FindOrCreateTicketService_1.default)(contact, whatsapp, unreadMessages, companyId, queueId, userId, groupContact, "whatsapp", isImported, false, settings);
            return result;
        });
        let bodyRollbackTag = "";
        let bodyNextTag = "";
        let rollbackTag;
        let nextTag;
        let ticketTag = undefined;
        // console.log(ticket.id)
        if (ticket?.company?.plan?.useKanban) {
            ticketTag = await TicketTag_1.default.findOne({
                where: {
                    ticketId: ticket.id
                }
            });
            if (ticketTag) {
                const tag = await Tag_1.default.findByPk(ticketTag.tagId);
                console.log("log... 3033");
                if (tag.nextLaneId) {
                    nextTag = await Tag_1.default.findByPk(tag.nextLaneId);
                    console.log("log... 3036");
                    bodyNextTag = nextTag.greetingMessageLane;
                }
                if (tag.rollbackLaneId) {
                    rollbackTag = await Tag_1.default.findByPk(tag.rollbackLaneId);
                    console.log("log... 3041");
                    bodyRollbackTag = rollbackTag.greetingMessageLane;
                }
            }
        }
        if (ticket.status === "closed" ||
            (unreadMessages === 0 &&
                whatsapp.complationMessage &&
                (0, Mustache_1.default)(whatsapp.complationMessage, ticket) === bodyMessage)) {
            return;
        }
        if (rollbackTag &&
            (0, Mustache_1.default)(bodyNextTag, ticket) !== bodyMessage &&
            (0, Mustache_1.default)(bodyRollbackTag, ticket) !== bodyMessage) {
            await TicketTag_1.default.destroy({
                where: { ticketId: ticket.id, tagId: ticketTag.tagId }
            });
            await TicketTag_1.default.create({ ticketId: ticket.id, tagId: rollbackTag.id });
        }
        if (isImported) {
            console.log("log... 3063");
            await ticket.update({
                queueId: whatsapp.queueIdImportMessages
            });
        }
        // console.log(msg.message?.editedMessage)
        // console.log(ticket)
        if (msgType === "editedMessage" || msgType === "protocolMessage") {
            const msgKeyIdEdited = msgType === "editedMessage"
                ? msg.message.editedMessage.message.protocolMessage.key.id
                : msg.message?.protocolMessage.key.id;
            let bodyEdited = findCaption(msg.message);
            console.log("log... 3075");
            // console.log("bodyEdited", bodyEdited)
            const io = (0, socket_1.getIO)();
            try {
                const messageToUpdate = await Message_1.default.findOne({
                    where: {
                        wid: msgKeyIdEdited,
                        companyId,
                        ticketId: ticket.id
                    }
                });
                if (!messageToUpdate)
                    return;
                await messageToUpdate.update({ isEdited: true, body: bodyEdited });
                await ticket.update({ lastMessage: bodyEdited });
                console.log("log... 3094");
                io.of(String(companyId))
                    // .to(String(ticket.id))
                    .emit(`company-${companyId}-appMessage`, {
                    action: "update",
                    message: messageToUpdate
                });
                io.of(String(companyId))
                    // .to(ticket.status)
                    // .to("notification")
                    // .to(String(ticket.id))
                    .emit(`company-${companyId}-ticket`, {
                    action: "update",
                    ticket
                });
            }
            catch (err) {
                Sentry.captureException(err);
                logger_1.default.error(`Error handling message ack. Err: ${err}`);
            }
            return;
        }
        const ticketTraking = await (0, FindOrCreateATicketTrakingService_1.default)({
            ticketId: ticket.id,
            companyId,
            userId,
            whatsappId: whatsapp?.id
        });
        let useLGPD = false;
        try {
            if (!msg.key.fromMe) {
                //MENSAGEM DE FÉRIAS COLETIVAS
                console.log("log... 3131");
                if (!(0, lodash_1.isNil)(whatsapp.collectiveVacationMessage && !isGroup)) {
                    const currentDate = (0, moment_1.default)();
                    console.log("log... 3136");
                    if (currentDate.isBetween((0, moment_1.default)(whatsapp.collectiveVacationStart), (0, moment_1.default)(whatsapp.collectiveVacationEnd))) {
                        console.log("log... 3140");
                        if (hasMedia) {
                            console.log("log... 3144");
                            await (0, exports.verifyMediaMessage)(msg, ticket, contact, ticketTraking, false, false, wbot);
                        }
                        else {
                            console.log("log... 3148");
                            await (0, exports.verifyMessage)(msg, ticket, contact, ticketTraking);
                        }
                        console.log("log... 3152");
                        wbot.sendMessage(contact.remoteJid, {
                            text: whatsapp.collectiveVacationMessage
                        });
                        return;
                    }
                }
            }
        }
        catch (e) {
            Sentry.captureException(e);
            console.log(e);
        }
        const isMsgForwarded = msg.message?.extendedTextMessage?.contextInfo?.isForwarded ||
            msg.message?.imageMessage?.contextInfo?.isForwarded ||
            msg.message?.audioMessage?.contextInfo?.isForwarded ||
            msg.message?.videoMessage?.contextInfo?.isForwarded ||
            msg.message?.documentMessage?.contextInfo?.isForwarded;
        let mediaSent;
        if (!useLGPD) {
            console.log("log... 3391");
            if (hasMedia) {
                console.log("log... 3393");
                mediaSent = await (0, exports.verifyMediaMessage)(msg, ticket, contact, ticketTraking, isMsgForwarded, false, wbot);
            }
            else {
                console.log("log... 3396");
                // console.log("antes do verifyMessage")
                await (0, exports.verifyMessage)(msg, ticket, contact, ticketTraking, false, isMsgForwarded);
            }
        }
        try {
            if (!msg.key.fromMe) {
                console.log("log... 3226");
                console.log("log... 3227", { ticketTraking });
                if (ticketTraking !== null && (0, exports.verifyRating)(ticketTraking)) {
                    (0, exports.handleRating)(parseFloat(bodyMessage), ticket, ticketTraking);
                    return;
                }
            }
        }
        catch (e) {
            Sentry.captureException(e);
            console.log(e);
        }
        // Atualiza o ticket se a ultima mensagem foi enviada por mim, para que possa ser finalizado.
        try {
            console.log("log... 3258");
            await ticket.update({
                fromMe: msg.key.fromMe
            });
        }
        catch (e) {
            Sentry.captureException(e);
            console.log(e);
        }
        let currentSchedule;
        if (settings.scheduleType === "company") {
            console.log("log... 3270");
            currentSchedule = await (0, VerifyCurrentSchedule_1.default)(companyId, 0, 0);
        }
        else if (settings.scheduleType === "connection") {
            console.log("log... 3273");
            currentSchedule = await (0, VerifyCurrentSchedule_1.default)(companyId, 0, whatsapp.id);
        }
        try {
            if (!msg.key.fromMe &&
                settings.scheduleType &&
                (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
                !["open", "group"].includes(ticket.status)) {
                /**
                 * Tratamento para envio de mensagem quando a empresa está fora do expediente
                 */
                console.log("log... 3280");
                if ((settings.scheduleType === "company" ||
                    settings.scheduleType === "connection") &&
                    !(0, lodash_1.isNil)(currentSchedule) &&
                    (!currentSchedule || currentSchedule.inActivity === false)) {
                    console.log("log... 3289");
                    if (whatsapp.maxUseBotQueues &&
                        whatsapp.maxUseBotQueues !== 0 &&
                        ticket.amountUsedBotQueues >= whatsapp.maxUseBotQueues) {
                        // await UpdateTicketService({
                        //   ticketData: { queueId: queues[0].id },
                        //   ticketId: ticket.id
                        // });
                        return;
                    }
                    if (whatsapp.timeUseBotQueues !== "0") {
                        console.log("log... 3300");
                        if (ticket.isOutOfHour === false &&
                            ticketTraking.chatbotAt !== null) {
                            console.log("log... 3302");
                            await ticketTraking.update({
                                chatbotAt: null
                            });
                            await ticket.update({
                                amountUsedBotQueues: 0
                            });
                        }
                        //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
                        let dataLimite = new Date();
                        let Agora = new Date();
                        if (ticketTraking.chatbotAt !== null) {
                            dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() +
                                Number(whatsapp.timeUseBotQueues));
                            console.log("log... 3318");
                            if (ticketTraking.chatbotAt !== null &&
                                Agora < dataLimite &&
                                whatsapp.timeUseBotQueues !== "0" &&
                                ticket.amountUsedBotQueues !== 0) {
                                return;
                            }
                        }
                        await ticketTraking.update({
                            chatbotAt: null
                        });
                    }
                    //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
                    await ticket.update({
                        isOutOfHour: true,
                        amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                    });
                    return;
                }
            }
        }
        catch (e) {
            Sentry.captureException(e);
            console.log(e);
        }
        const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
            where: {
                id: ticket.flowStopped
            }
        });
        let isMenu = false;
        let isOpenai = false;
        let isQuestion = false;
        if (flow) {
            isMenu =
                flow.flow["nodes"].find((node) => node.id === ticket.lastFlowId)
                    ?.type === "menu";
            isOpenai =
                flow.flow["nodes"].find((node) => node.id === ticket.lastFlowId)
                    ?.type === "openai";
            isQuestion =
                flow.flow["nodes"].find((node) => node.id === ticket.lastFlowId)
                    ?.type === "question";
        }
        if (!(0, lodash_1.isNil)(flow) && isQuestion && !msg.key.fromMe) {
            console.log("|============= QUESTION =============|", JSON.stringify(flow, null, 4));
            const body = (0, exports.getBodyMessage)(msg);
            if (body) {
                const nodes = flow.flow["nodes"];
                const nodeSelected = flow.flow["nodes"].find((node) => node.id === ticket.lastFlowId);
                const connections = flow.flow["connections"];
                const { message, answerKey } = nodeSelected.data.typebotIntegration;
                const oldDataWebhook = ticket.dataWebhook;
                const nodeIndex = nodes.findIndex(node => node.id === nodeSelected.id);
                const lastFlowId = nodes[nodeIndex + 1].id;
                await ticket.update({
                    lastFlowId: lastFlowId,
                    dataWebhook: {
                        variables: {
                            [answerKey]: body
                        }
                    }
                });
                await ticket.save();
                const mountDataContact = {
                    number: contact.number,
                    name: contact.name,
                    email: contact.email
                };
                await (0, ActionsWebhookService_1.ActionsWebhookService)(whatsapp.id, parseInt(ticket.flowStopped), ticket.companyId, nodes, connections, lastFlowId, null, "", "", "", ticket.id, mountDataContact, msg);
            }
            return;
        }
        if (isOpenai && !(0, lodash_1.isNil)(flow) && !ticket.queue) {
            const nodeSelected = flow.flow["nodes"].find((node) => node.id === ticket.lastFlowId);
            let { name, prompt, voice, voiceKey, voiceRegion, maxTokens, temperature, apiKey, queueId, maxMessages } = nodeSelected.data.typebotIntegration;
            let openAiSettings = {
                name,
                prompt,
                voice,
                voiceKey,
                voiceRegion,
                maxTokens: parseInt(maxTokens),
                temperature: parseInt(temperature),
                apiKey,
                queueId: parseInt(queueId),
                maxMessages: parseInt(maxMessages)
            };
            await (0, OpenAiService_1.handleOpenAi)(openAiSettings, msg, wbot, ticket, contact, mediaSent, ticketTraking);
            return;
        }
        //openai na conexao
        if (!ticket.queue &&
            !isGroup &&
            !msg.key.fromMe &&
            !ticket.userId &&
            !(0, lodash_1.isNil)(whatsapp.promptId)) {
            const { prompt } = whatsapp;
            await (0, OpenAiService_1.handleOpenAi)(prompt, msg, wbot, ticket, contact, mediaSent, ticketTraking);
        }
        //integraçao na conexao
        if (!ticket.imported &&
            !msg.key.fromMe &&
            !ticket.isGroup &&
            !ticket.queue &&
            !ticket.user &&
            ticket.isBot &&
            !(0, lodash_1.isNil)(whatsapp.integrationId) &&
            !ticket.useIntegration) {
            console.log("3245");
            const integrations = await (0, ShowQueueIntegrationService_1.default)(whatsapp.integrationId, companyId);
            await (0, exports.handleMessageIntegration)(msg, wbot, companyId, integrations, ticket, isMenu, whatsapp, contact, isFirstMsg);
            return;
        }
        // integração flowbuilder
        if (!ticket.imported &&
            !msg.key.fromMe &&
            !ticket.isGroup &&
            !ticket.queue &&
            !ticket.user &&
            !(0, lodash_1.isNil)(whatsapp.integrationId) &&
            !ticket.useIntegration) {
            const integrations = await (0, ShowQueueIntegrationService_1.default)(whatsapp.integrationId, companyId);
            await (0, exports.handleMessageIntegration)(msg, wbot, companyId, integrations, ticket, isMenu, whatsapp, contact, isFirstMsg);
        }
        if (!(0, lodash_1.isNil)(ticket.typebotSessionId) &&
            ticket.typebotStatus &&
            !msg.key.fromMe &&
            !(0, lodash_1.isNil)(ticket.typebotSessionTime) &&
            ticket.useIntegration) {
            console.log("|================== CONTINUE TYPEBO ==============|");
            const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
                where: {
                    id: ticket.flowStopped
                }
            });
            // Verificar se o flow é null ou undefined antes de acessar suas propriedades
            if (!flow) {
                console.error("Flow not found for ticket:", ticket.id);
                return; // Ou qualquer outro tratamento de erro apropriado
            }
            const nodes = flow.flow["nodes"];
            // Verificar se o nodes não é vazio
            if (!nodes || nodes.length === 0) {
                console.error("No nodes found for flow:", flow.id);
                return; // Ou outro tratamento de erro apropriado
            }
            const lastFlow = nodes.find(f => f.id === ticket.lastFlowId);
            // Verificar se lastFlow existe antes de acessar suas propriedades
            if (!lastFlow || !lastFlow.data) {
                console.error("Last flow or data not found for ticket:", ticket.id);
                return; // Ou qualquer outro tratamento de erro apropriado
            }
            const typebot = lastFlow.data.typebotIntegration;
            await (0, typebotListener_1.default)({
                wbot: wbot,
                msg,
                ticket,
                typebot: lastFlow.data.typebotIntegration
            });
            return;
        }
        if (!ticket.imported &&
            !msg.key.fromMe &&
            !ticket.isGroup &&
            !ticket.userId &&
            ticket.integrationId &&
            ticket.useIntegration) {
            const integrations = await (0, ShowQueueIntegrationService_1.default)(ticket.integrationId, companyId);
            console.log("3264");
            console.log("3257", { ticket });
            await (0, exports.handleMessageIntegration)(msg, wbot, companyId, integrations, ticket, null, null, contact, null);
            if (msg.key.fromMe) {
                await ticket.update({
                    typebotSessionTime: (0, moment_1.default)().toDate()
                });
            }
        }
        if (!ticket.imported &&
            !ticket.queue &&
            (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
            !msg.key.fromMe &&
            !ticket.userId &&
            whatsapp.queues.length >= 1 &&
            !ticket.useIntegration) {
            // console.log("antes do verifyqueue")
            await verifyQueue(wbot, msg, ticket, contact, settings, ticketTraking);
            if (ticketTraking.chatbotAt === null) {
                await ticketTraking.update({
                    chatbotAt: (0, moment_1.default)().toDate()
                });
            }
        }
        if (ticket.queueId > 0) {
            await ticketTraking.update({
                queueId: ticket.queueId
            });
        }
        // Verificação se aceita audio do contato
        if (getTypeMessage(msg) === "audioMessage" &&
            !msg.key.fromMe &&
            (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
            (!contact?.acceptAudioMessage ||
                settings?.acceptAudioMessageContact === "disabled")) {
            const sentMessage = await wbot.sendMessage(`${contact.number}@c.us`, {
                text: `\u200e*Assistente Virtual*:\nInfelizmente não conseguimos escutar nem enviar áudios por este canal de atendimento, por favor, envie uma mensagem de *texto*.`
            }, {
                quoted: {
                    key: msg.key,
                    message: {
                        extendedTextMessage: msg.message.extendedTextMessage
                    }
                }
            });
            await (0, exports.verifyMessage)(sentMessage, ticket, contact, ticketTraking);
        }
        try {
            if (!msg.key.fromMe &&
                settings?.scheduleType &&
                ticket.queueId !== null &&
                (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
                ticket.status !== "open") {
                /**
                 * Tratamento para envio de mensagem quando a empresa/fila está fora do expediente
                 */
                const queue = await Queue_1.default.findByPk(ticket.queueId);
                if (settings?.scheduleType === "queue") {
                    currentSchedule = await (0, VerifyCurrentSchedule_1.default)(companyId, queue.id, 0);
                }
                if (settings?.scheduleType === "queue" &&
                    !(0, lodash_1.isNil)(currentSchedule) &&
                    ticket.amountUsedBotQueues < whatsapp.maxUseBotQueues &&
                    (!currentSchedule || currentSchedule.inActivity === false) &&
                    !ticket.imported) {
                    if (Number(whatsapp.timeUseBotQueues) > 0) {
                        if (ticket.isOutOfHour === false &&
                            ticketTraking.chatbotAt !== null) {
                            await ticketTraking.update({
                                chatbotAt: null
                            });
                            await ticket.update({
                                amountUsedBotQueues: 0
                            });
                        }
                        //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
                        let dataLimite = new Date();
                        let Agora = new Date();
                        if (ticketTraking.chatbotAt !== null) {
                            dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() +
                                Number(whatsapp.timeUseBotQueues));
                            if (ticketTraking.chatbotAt !== null &&
                                Agora < dataLimite &&
                                whatsapp.timeUseBotQueues !== "0" &&
                                ticket.amountUsedBotQueues !== 0) {
                                return;
                            }
                        }
                        await ticketTraking.update({
                            chatbotAt: null
                        });
                    }
                    const outOfHoursMessage = queue.outOfHoursMessage;
                    if (outOfHoursMessage !== "") {
                        // console.log("entrei2");
                        const body = (0, Mustache_1.default)(`${outOfHoursMessage}`, ticket);
                        const debouncedSentMessage = (0, Debounce_1.debounce)(async () => {
                            await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                                text: body
                            });
                        }, 1000, ticket.id);
                        debouncedSentMessage();
                    }
                    //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
                    await ticket.update({
                        isOutOfHour: true,
                        amountUsedBotQueues: ticket.amountUsedBotQueues + 1
                    });
                    return;
                }
            }
        }
        catch (e) {
            Sentry.captureException(e);
            console.log(e);
        }
        if (ticket.queue && ticket.queueId && !msg.key.fromMe) {
            if (!ticket.user || ticket.queue?.chatbots?.length > 0) {
                await (0, ChatBotListener_1.sayChatbot)(ticket.queueId, wbot, ticket, contact, msg, ticketTraking);
            }
            //atualiza mensagem para indicar que houve atividade e aí contar o tempo novamente para enviar mensagem de inatividade
            await ticket.update({
                sendInactiveMessage: false
            });
        }
        await ticket.reload();
    }
    catch (err) {
        Sentry.captureException(err);
        console.log(err);
        logger_1.default.error(`Error handling whatsapp message: Err: ${err}`);
    }
};
exports.handleMessage = handleMessage;
const handleMsgAck = async (msg, chat) => {
    await new Promise(r => setTimeout(r, 500));
    const io = (0, socket_1.getIO)();
    try {
        const messageToUpdate = await Message_1.default.findOne({
            where: {
                wid: msg.key.id
            },
            include: [
                "contact",
                {
                    model: Ticket_1.default,
                    as: "ticket",
                    include: [
                        {
                            model: Contact_1.default,
                            attributes: [
                                "id",
                                "name",
                                "number",
                                "email",
                                "profilePicUrl",
                                "acceptAudioMessage",
                                "active",
                                "urlPicture",
                                "companyId"
                            ],
                            include: ["extraInfo", "tags"]
                        },
                        {
                            model: Queue_1.default,
                            attributes: ["id", "name", "color"]
                        },
                        {
                            model: Whatsapp_1.default,
                            attributes: ["id", "name", "groupAsTicket"]
                        },
                        {
                            model: User_1.default,
                            attributes: ["id", "name"]
                        },
                        {
                            model: Tag_1.default,
                            as: "tags",
                            attributes: ["id", "name", "color"]
                        }
                    ]
                },
                {
                    model: Message_1.default,
                    as: "quotedMsg",
                    include: ["contact"]
                }
            ]
        });
        if (!messageToUpdate || messageToUpdate.ack > chat)
            return;
        await messageToUpdate.update({ ack: chat });
        io.of(messageToUpdate.companyId.toString())
            // .to(messageToUpdate.ticketId.toString())
            .emit(`company-${messageToUpdate.companyId}-appMessage`, {
            action: "update",
            message: messageToUpdate
        });
    }
    catch (err) {
        Sentry.captureException(err);
        logger_1.default.error(`Error handling message ack. Err: ${err}`);
    }
};
exports.handleMsgAck = handleMsgAck;
const verifyRecentCampaign = async (message, companyId) => {
    if (!isValidMsg(message)) {
        return;
    }
    if (!message.key.fromMe) {
        const number = message.key.remoteJid.replace(/\D/g, "");
        const campaigns = await Campaign_1.default.findAll({
            where: { companyId, status: "EM_ANDAMENTO", confirmation: true }
        });
        if (campaigns) {
            const ids = campaigns.map(c => c.id);
            const campaignShipping = await CampaignShipping_1.default.findOne({
                where: {
                    campaignId: { [sequelize_1.Op.in]: ids },
                    number,
                    confirmation: null,
                    deliveredAt: { [sequelize_1.Op.ne]: null }
                }
            });
            if (campaignShipping) {
                await campaignShipping.update({
                    confirmedAt: (0, moment_1.default)(),
                    confirmation: true
                });
                await queues_1.campaignQueue.add("DispatchCampaign", {
                    campaignShippingId: campaignShipping.id,
                    campaignId: campaignShipping.campaignId
                }, {
                    delay: (0, queues_1.parseToMilliseconds)((0, queues_1.randomValue)(0, 10))
                });
            }
        }
    }
};
const verifyCampaignMessageAndCloseTicket = async (message, companyId, wbot) => {
    if (!isValidMsg(message)) {
        return;
    }
    const io = (0, socket_1.getIO)();
    const body = await (0, exports.getBodyMessage)(message);
    const isCampaign = /\u200c/.test(body);
    if (message.key.fromMe && isCampaign) {
        let msgContact;
        msgContact = await getContactMessage(message, wbot);
        const contact = await verifyContact(msgContact, wbot, companyId);
        const messageRecord = await Message_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ wid: message.key.id }, { contactId: contact.id }],
                companyId
            }
        });
        if (!(0, lodash_1.isNull)(messageRecord) ||
            !(0, lodash_1.isNil)(messageRecord) ||
            messageRecord !== null) {
            const ticket = await Ticket_1.default.findByPk(messageRecord.ticketId);
            await ticket.update({ status: "closed", amountUsedBotQueues: 0 });
            io.of(String(companyId))
                // .to("open")
                .emit(`company-${companyId}-ticket`, {
                action: "delete",
                ticket,
                ticketId: ticket.id
            });
            io.of(String(companyId))
                // .to(ticket.status)
                // .to(ticket.id.toString())
                .emit(`company-${companyId}-ticket`, {
                action: "update",
                ticket,
                ticketId: ticket.id
            });
        }
    }
};
const filterMessages = (msg) => {
    wbot_1.msgDB.save(msg);
    if (msg.message?.protocolMessage?.editedMessage)
        return true;
    if (msg.message?.protocolMessage)
        return false;
    if ([
        baileys_1.WAMessageStubType.REVOKE,
        baileys_1.WAMessageStubType.E2E_DEVICE_CHANGED,
        baileys_1.WAMessageStubType.E2E_IDENTITY_CHANGED,
        baileys_1.WAMessageStubType.CIPHERTEXT
    ].includes(msg.messageStubType))
        return false;
    return true;
};
const wbotMessageListener = (wbot, companyId) => {
    wbot.ev.on("messages.upsert", async (messageUpsert) => {
        const messages = messageUpsert.messages
            .filter(filterMessages)
            .map(msg => msg);
        if (!messages)
            return;
        // console.log("CIAAAAAAA WBOT " , companyId)
        messages.forEach(async (message) => {
            if (message?.messageStubParameters?.length &&
                message.messageStubParameters[0].includes("absent")) {
                const msg = {
                    companyId: companyId,
                    whatsappId: wbot.id,
                    message: message
                };
                logger_1.default.warn("MENSAGEM PERDIDA", JSON.stringify(msg));
            }
            const messageExists = await Message_1.default.count({
                where: { wid: message.key.id, companyId }
            });
            if (!messageExists) {
                let isCampaign = false;
                let body = await (0, exports.getBodyMessage)(message);
                const fromMe = message?.key?.fromMe;
                if (fromMe) {
                    isCampaign = /\u200c/.test(body);
                }
                else {
                    if (/\u200c/.test(body))
                        body = body.replace(/\u200c/, "");
                    logger_1.default.debug("Validação de mensagem de campanha enviada por terceiros: " + body);
                }
                if (!isCampaign) {
                    if (redis_1.REDIS_URI_MSG_CONN !== "") {
                        //} && (!message.key.fromMe || (message.key.fromMe && !message.key.id.startsWith('BAE')))) {
                        try {
                            await queue_1.default.add(`${process.env.DB_NAME}-handleMessage`, { message, wbot: wbot.id, companyId }, {
                                priority: 1,
                                jobId: `${wbot.id}-handleMessage-${message.key.id}`
                            });
                        }
                        catch (e) {
                            Sentry.captureException(e);
                        }
                    }
                    else {
                        console.log("log... 3970");
                        await handleMessage(message, wbot, companyId);
                    }
                }
                await verifyRecentCampaign(message, companyId);
                await verifyCampaignMessageAndCloseTicket(message, companyId, wbot);
            }
            if (message.key.remoteJid?.endsWith("@g.us")) {
                if (redis_1.REDIS_URI_MSG_CONN !== "") {
                    queue_1.default.add(`${process.env.DB_NAME}-handleMessageAck`, { msg: message, chat: 2 }, {
                        priority: 1,
                        jobId: `${wbot.id}-handleMessageAck-${message.key.id}`
                    });
                }
                else {
                    handleMsgAck(message, 2);
                }
            }
        });
        // messages.forEach(async (message: proto.IWebMessageInfo) => {
        //   const messageExists = await Message.count({
        //     where: { id: message.key.id!, companyId }
        //   });
        //   if (!messageExists) {
        //     await handleMessage(message, wbot, companyId);
        //     await verifyRecentCampaign(message, companyId);
        //     await verifyCampaignMessageAndCloseTicket(message, companyId);
        //   }
        // });
    });
    wbot.ev.on("messages.update", (messageUpdate) => {
        if (messageUpdate.length === 0)
            return;
        messageUpdate.forEach(async (message) => {
            wbot.readMessages([message.key]);
            const msgUp = { ...messageUpdate };
            if (msgUp["0"]?.update.messageStubType === 1 &&
                msgUp["0"]?.key.remoteJid !== "status@broadcast") {
                (0, MarkDeleteWhatsAppMessage_1.default)(msgUp["0"]?.key.remoteJid, null, msgUp["0"]?.key.id, companyId);
            }
            let ack;
            if (message.update.status === 3 && message?.key?.fromMe) {
                ack = 2;
            }
            else {
                ack = message.update.status;
            }
            if (redis_1.REDIS_URI_MSG_CONN !== "") {
                queue_1.default.add(`${process.env.DB_NAME}-handleMessageAck`, { msg: message, chat: ack }, {
                    priority: 1,
                    jobId: `${wbot.id}-handleMessageAck-${message.key.id}`
                });
            }
            else {
                handleMsgAck(message, ack);
            }
        });
    });
    // wbot.ev.on('message-receipt.update', (events: any) => {
    //   events.forEach(async (msg: any) => {
    //     const ack = msg?.receipt?.receiptTimestamp ? 3 : msg?.receipt?.readTimestamp ? 4 : 0;
    //     if (!ack) return;
    //     await handleMsgAck(msg, ack);
    //   });
    // })
    // wbot.ev.on("presence.update", (events: any) => {
    //   console.log(events)
    // })
    wbot.ev.on("contacts.update", (contacts) => {
        contacts.forEach(async (contact) => {
            if (!contact?.id)
                return;
            if (typeof contact.imgUrl !== "undefined") {
                const newUrl = contact.imgUrl === ""
                    ? ""
                    : await wbot.profilePictureUrl(contact.id).catch(() => null);
                const contactData = {
                    name: contact.id.replace(/\D/g, ""),
                    number: contact.id.replace(/\D/g, ""),
                    isGroup: contact.id.includes("@g.us") ? true : false,
                    companyId: companyId,
                    remoteJid: contact.id,
                    profilePicUrl: newUrl,
                    whatsappId: wbot.id,
                    wbot: wbot
                };
                await (0, CreateOrUpdateContactService_1.default)(contactData);
            }
        });
    });
    wbot.ev.on("groups.update", (groupUpdate) => {
        if (!groupUpdate[0]?.id)
            return;
        if (groupUpdate.length === 0)
            return;
        groupUpdate.forEach(async (group) => {
            const number = group.id.replace(/\D/g, "");
            const nameGroup = group.subject || number;
            let profilePicUrl = "";
            try {
                profilePicUrl = await wbot.profilePictureUrl(group.id, "image");
            }
            catch (e) {
                Sentry.captureException(e);
                profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
            }
            const contactData = {
                name: nameGroup,
                number: number,
                isGroup: true,
                companyId: companyId,
                remoteJid: group.id,
                profilePicUrl,
                whatsappId: wbot.id,
                wbot: wbot
            };
            const contact = await (0, CreateOrUpdateContactService_1.default)(contactData);
        });
    });
};
exports.wbotMessageListener = wbotMessageListener;
