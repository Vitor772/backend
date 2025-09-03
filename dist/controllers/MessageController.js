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
exports.sendMessageFlow = exports.edit = exports.send = exports.allMe = exports.remove = exports.forwardMessage = exports.store = exports.index = exports.transcribeAudioMessage = exports.sendPIXMessage = exports.sendURLMessage = exports.sendCALLMessage = exports.sendCopyMessage = exports.sendListMessage = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const fs_1 = __importDefault(require("fs"));
const GetTicketWbot_1 = __importDefault(require("../helpers/GetTicketWbot"));
const SetTicketMessagesAsRead_1 = __importDefault(require("../helpers/SetTicketMessagesAsRead"));
const socket_1 = require("../libs/socket");
const Message_1 = __importDefault(require("../models/Message"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Queue_1 = __importDefault(require("../models/Queue"));
const User_1 = __importDefault(require("../models/User"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const path_1 = __importDefault(require("path"));
const lodash_1 = require("lodash");
const async_mutex_1 = require("async-mutex");
const ListMessagesService_1 = __importDefault(require("../services/MessageServices/ListMessagesService"));
const ShowTicketService_1 = __importDefault(require("../services/TicketServices/ShowTicketService"));
const DeleteWhatsAppMessage_1 = __importDefault(require("../services/WbotServices/DeleteWhatsAppMessage"));
const SendWhatsAppMedia_1 = __importDefault(require("../services/WbotServices/SendWhatsAppMedia"));
const SendWhatsAppMessage_1 = __importDefault(require("../services/WbotServices/SendWhatsAppMessage"));
const CreateMessageService_1 = __importDefault(require("../services/MessageServices/CreateMessageService"));
const sendFacebookMessageMedia_1 = require("../services/FacebookServices/sendFacebookMessageMedia");
const sendFacebookMessage_1 = __importDefault(require("../services/FacebookServices/sendFacebookMessage"));
const ShowPlanCompanyService_1 = __importDefault(require("../services/CompanyService/ShowPlanCompanyService"));
const ListMessagesServiceAll_1 = __importDefault(require("../services/MessageServices/ListMessagesServiceAll"));
const ShowContactService_1 = __importDefault(require("../services/ContactServices/ShowContactService"));
const FindOrCreateTicketService_1 = __importDefault(require("../services/TicketServices/FindOrCreateTicketService"));
const Contact_1 = __importDefault(require("../models/Contact"));
const wbotMessageListener_1 = require("../services/WbotServices/wbotMessageListener");
const UpdateTicketService_1 = __importDefault(require("../services/TicketServices/UpdateTicketService"));
const ShowMessageService_1 = __importStar(require("../services/MessageServices/ShowMessageService"));
const CompaniesSettings_1 = __importDefault(require("../models/CompaniesSettings"));
const facebookMessageListener_1 = require("../services/FacebookServices/facebookMessageListener");
const EditWhatsAppMessage_1 = __importDefault(require("../services/MessageServices/EditWhatsAppMessage"));
const CheckNumber_1 = __importDefault(require("../services/WbotServices/CheckNumber"));
const TranscribeAudioMessageService_1 = __importDefault(require("../services/MessageServices/TranscribeAudioMessageService"));
const baileys_1 = require("@whiskeysockets/baileys");
// adicionar funções de botões, pix, etc.
const sendListMessage = async (req, res) => {
    const { ticketId } = req.params;
    const { title, text, buttonText, footer, sections } = req.body;
    try {
        const ticket = await Ticket_1.default.findByPk(ticketId);
        if (!ticket) {
            throw new AppError_1.default("Ticket not found", 404);
        }
        const contact = await Contact_1.default.findByPk(ticket.contactId);
        if (!contact) {
            throw new AppError_1.default("Contact not found", 404);
        }
        const wbot = await (0, GetTicketWbot_1.default)(ticket);
        const listMessage = {
            text,
            title,
            buttonText,
            footer,
            sections
        };
        const number = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
        console.log('Numero do cliente:', number);
        const sendMsg = await wbot.sendMessage(number, listMessage);
        await (0, wbotMessageListener_1.verifyMessage)(sendMsg, ticket, contact);
        return res.status(200).json({ message: "List message sent successfully", sendMsg });
    }
    catch (err) {
        console.error("Error sending list message: ", err);
        throw new AppError_1.default("Error sending list message", 500);
    }
};
exports.sendListMessage = sendListMessage;
const sendCopyMessage = async (req, res) => {
    const { ticketId } = req.params;
    const { title, description, buttonText, copyText } = req.body;
    try {
        const ticket = await Ticket_1.default.findByPk(ticketId);
        if (!ticket) {
            throw new AppError_1.default("Ticket not found", 404);
        }
        const contact = await Contact_1.default.findByPk(ticket.contactId);
        if (!contact) {
            throw new AppError_1.default("Contact not found", 404);
        }
        const whatsapp = await Whatsapp_1.default.findOne({ where: { id: ticket.whatsappId } });
        if (!whatsapp || !whatsapp.number) {
            console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
            throw new Error('Número de WhatsApp não encontrado');
        }
        const botNumber = whatsapp.number;
        const wbot = await (0, GetTicketWbot_1.default)(ticket);
        const copyMessage = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: title || 'Botão copiar',
                        },
                        footer: {
                            text: description || 'Botão copiar',
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: buttonText || 'Botão copiar',
                                        copy_code: copyText || 'Botão copiar',
                                    }),
                                },
                            ],
                            messageParamsJson: JSON.stringify({
                                from: 'apiv2',
                                templateId: '4194019344155670',
                            }),
                        },
                    },
                },
            },
        };
        const number = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
        const newMsg = (0, baileys_1.generateWAMessageFromContent)(number, copyMessage, {
            userJid: botNumber,
        });
        await wbot.relayMessage(number, newMsg.message, { messageId: newMsg.key.id });
        if (newMsg) {
            await wbot.upsertMessage(newMsg, 'notify');
        }
        return res.status(200).json({ message: "Copy message sent successfully", newMsg });
    }
    catch (error) {
        console.error('Erro ao enviar a mensagem de cópia:', error);
        throw new AppError_1.default("Error sending copy message", 500);
    }
};
exports.sendCopyMessage = sendCopyMessage;
const sendCALLMessage = async (req, res) => {
    const { ticketId } = req.params;
    const { title, description, buttonText, copyText } = req.body;
    try {
        const ticket = await Ticket_1.default.findByPk(ticketId);
        if (!ticket) {
            throw new AppError_1.default("Ticket not found", 404);
        }
        const contact = await Contact_1.default.findByPk(ticket.contactId);
        if (!contact) {
            throw new AppError_1.default("Contact not found", 404);
        }
        const whatsapp = await Whatsapp_1.default.findOne({ where: { id: ticket.whatsappId } });
        if (!whatsapp || !whatsapp.number) {
            console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
            throw new Error('Número de WhatsApp não encontrado');
        }
        const botNumber = whatsapp.number;
        const wbot = await (0, GetTicketWbot_1.default)(ticket);
        const copyMessage = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: title || 'Botão copiar',
                        },
                        footer: {
                            text: description || 'Botão copiar',
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'cta_call',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: buttonText || 'Botão copiar',
                                        phoneNumber: copyText || 'Botão copiar',
                                    })
                                },
                            ],
                            messageParamsJson: JSON.stringify({
                                from: 'apiv2',
                                templateId: '4194019344155670',
                            }),
                        },
                    },
                },
            },
        };
        const number = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
        const newMsg = (0, baileys_1.generateWAMessageFromContent)(number, copyMessage, {
            userJid: botNumber,
        });
        await wbot.relayMessage(number, newMsg.message, { messageId: newMsg.key.id });
        if (newMsg) {
            await wbot.upsertMessage(newMsg, 'notify');
        }
        return res.status(200).json({ message: "Copy message sent successfully", newMsg });
    }
    catch (error) {
        console.error('Erro ao enviar a mensagem de cópia:', error);
        throw new AppError_1.default("Error sending copy message", 500);
    }
};
exports.sendCALLMessage = sendCALLMessage;
const sendURLMessage = async (req, res) => {
    const { ticketId } = req.params;
    const { image, title, description, buttonText, copyText } = req.body;
    try {
        const ticket = await Ticket_1.default.findByPk(ticketId);
        if (!ticket) {
            throw new AppError_1.default("Ticket not found", 404);
        }
        const contact = await Contact_1.default.findByPk(ticket.contactId);
        if (!contact) {
            throw new AppError_1.default("Contact not found", 404);
        }
        const whatsapp = await Whatsapp_1.default.findOne({ where: { id: ticket.whatsappId } });
        if (!whatsapp || !whatsapp.number) {
            console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
            throw new Error('Número de WhatsApp não encontrado');
        }
        const botNumber = whatsapp.number;
        const wbot = await (0, GetTicketWbot_1.default)(ticket);
        let copyMessage;
        if (image) {
            const base64Image = image.split(',')[1];
            const imageMessageContent = await (0, baileys_1.generateWAMessageContent)({
                image: {
                    url: `data:image/png;base64,${base64Image}`, // Use a URL data para imagem
                },
            }, { upload: wbot.waUploadToServer });
            // Crie a estrutura com o header e a imagem
            copyMessage = {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: {
                                text: title || 'Botão copiar', // Título da mensagem
                            },
                            footer: {
                                text: description || 'Botão copiar', // Descrição da mensagem
                            },
                            header: {
                                imageMessage: imageMessageContent,
                                hasMediaAttachment: true,
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: 'cta_url',
                                        buttonParamsJson: JSON.stringify({
                                            display_text: buttonText || 'Botão copiar',
                                            url: copyText || 'Botão copiar',
                                        })
                                    },
                                ],
                                messageParamsJson: JSON.stringify({
                                    from: 'apiv2',
                                    templateId: '4194019344155670',
                                }),
                            },
                        },
                    },
                },
            };
        }
        else {
            copyMessage = {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: {
                                text: title || 'Botão copiar',
                            },
                            footer: {
                                text: description || 'Botão copiar',
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: 'cta_url',
                                        buttonParamsJson: JSON.stringify({
                                            display_text: buttonText || 'Botão copiar',
                                            url: copyText || 'Botão copiar',
                                        })
                                    },
                                ],
                                messageParamsJson: JSON.stringify({
                                    from: 'apiv2',
                                    templateId: '4194019344155670',
                                }),
                            },
                        },
                    },
                },
            };
        }
        const number = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
        const newMsg = (0, baileys_1.generateWAMessageFromContent)(number, copyMessage, {
            userJid: botNumber,
        });
        await wbot.relayMessage(number, newMsg.message, { messageId: newMsg.key.id });
        if (newMsg) {
            await wbot.upsertMessage(newMsg, 'notify');
        }
        return res.status(200).json({ message: "Copy message sent successfully", newMsg });
    }
    catch (error) {
        console.error('Erro ao enviar a mensagem de cópia:', error);
        throw new AppError_1.default("Error sending copy message", 500);
    }
};
exports.sendURLMessage = sendURLMessage;
const sendPIXMessage = async (req, res) => {
    const { ticketId } = req.params;
    const { sendkey_type, sendmerchant_name, title, sendvalue, sendKey } = req.body;
    try {
        const ticket = await Ticket_1.default.findByPk(ticketId);
        if (!ticket) {
            throw new AppError_1.default("Ticket not found", 404);
        }
        const contact = await Contact_1.default.findByPk(ticket.contactId);
        if (!contact) {
            throw new AppError_1.default("Contact not found", 404);
        }
        const whatsapp = await Whatsapp_1.default.findOne({ where: { id: ticket.whatsappId } });
        if (!whatsapp || !whatsapp.number) {
            throw new Error('Número de WhatsApp não encontrado');
        }
        const number = `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
        const botNumber = whatsapp.number;
        const wbot = await (0, GetTicketWbot_1.default)(ticket);
        const interactiveMsg = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "review_and_pay",
                                    buttonParamsJson: JSON.stringify({
                                        reference_id: generateRandomCode(),
                                        type: 'physical-goods',
                                        payment_configuration: 'merchant_categorization_code',
                                        payment_settings: [
                                            {
                                                type: "pix_static_code",
                                                pix_static_code: {
                                                    key: sendKey,
                                                    merchant_name: sendmerchant_name,
                                                    key_type: sendkey_type
                                                }
                                            },
                                            {
                                                type: "cards",
                                                cards: { enabled: false }
                                            }
                                        ],
                                        currency: "BRL",
                                        total_amount: {
                                            value: sendvalue * 100,
                                            offset: 100,
                                        },
                                        order: {
                                            status: 'payment_requested',
                                            items: [{
                                                    retailer_id: "custom-item",
                                                    name: title,
                                                    amount: {
                                                        value: sendvalue * 100,
                                                        offset: 100,
                                                    },
                                                    quantity: 1,
                                                    isCustomItem: true,
                                                    isQuantitySet: true,
                                                }],
                                            subtotal: {
                                                value: sendvalue * 100,
                                                offset: 100,
                                            },
                                            tax: null,
                                            shipping: null,
                                            discount: null,
                                            order_type: "ORDER",
                                        },
                                        native_payment_methods: []
                                    })
                                }
                            ],
                        },
                    },
                },
            },
        };
        const newMsg = (0, baileys_1.generateWAMessageFromContent)(number, interactiveMsg, { userJid: botNumber });
        // Envio da mensagem
        await wbot.relayMessage(number, newMsg.message, { messageId: newMsg.key.id });
        await wbot.upsertMessage(newMsg, 'notify');
        return res.status(200).json({ message: "Mensagem enviada com sucesso", newMsg });
    }
    catch (error) {
        console.error('Erro ao enviar a mensagem:', error);
        return res.status(500).json({ message: "Erro ao enviar a mensagem" });
    }
};
exports.sendPIXMessage = sendPIXMessage;
const generateRandomCode = (length = 11) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
};
//Transcrição de Audio
const transcribeAudioMessage = async (req, res) => {
    const { fileName } = req.params;
    const { companyId } = req.user;
    try {
        const transcribedText = await (0, TranscribeAudioMessageService_1.default)(fileName, companyId);
        if (typeof transcribedText === 'string') {
            return res.status(500).send({ error: transcribedText });
        }
        return res.send(transcribedText);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Erro ao transcrever a mensagem de áudio.' });
    }
};
exports.transcribeAudioMessage = transcribeAudioMessage;
const index = async (req, res) => {
    const { ticketId } = req.params;
    const { pageNumber, selectedQueues: queueIdsStringified } = req.query;
    const { companyId, profile } = req.user;
    let queues = [];
    const user = await User_1.default.findByPk(req.user.id, {
        include: [{ model: Queue_1.default, as: "queues" }]
    });
    if (queueIdsStringified) {
        queues = JSON.parse(queueIdsStringified);
    }
    else {
        user.queues.forEach(queue => {
            queues.push(queue.id);
        });
    }
    const { count, messages, ticket, hasMore } = await (0, ListMessagesService_1.default)({
        pageNumber,
        ticketId,
        companyId,
        queues,
        user
    });
    if (ticket.channel === "whatsapp" && ticket.whatsappId) {
        (0, SetTicketMessagesAsRead_1.default)(ticket);
    }
    return res.json({ count, messages, ticket, hasMore });
};
exports.index = index;
function obterNomeEExtensaoDoArquivo(url) {
    var urlObj = new URL(url);
    var pathname = urlObj.pathname;
    var filename = pathname.split('/').pop();
    var parts = filename.split('.');
    var nomeDoArquivo = parts[0];
    var extensao = parts[1];
    return `${nomeDoArquivo}.${extensao}`;
}
const store = async (req, res) => {
    const { ticketId } = req.params;
    const { body, quotedMsg, vCard, isPrivate = "false" } = req.body;
    const medias = req.files;
    const { companyId } = req.user;
    const ticket = await (0, ShowTicketService_1.default)(ticketId, companyId);
    if (ticket.channel === "whatsapp" && ticket.whatsappId) {
        (0, SetTicketMessagesAsRead_1.default)(ticket);
    }
    try {
        if (medias) {
            await Promise.all(medias.map(async (media, index) => {
                if (ticket.channel === "whatsapp") {
                    await (0, SendWhatsAppMedia_1.default)({ media, ticket, body: Array.isArray(body) ? body[index] : body, isPrivate: isPrivate === "true", isForwarded: false });
                }
                if (["facebook", "instagram"].includes(ticket.channel)) {
                    try {
                        const sentMedia = await (0, sendFacebookMessageMedia_1.sendFacebookMessageMedia)({
                            media,
                            ticket,
                            body: Array.isArray(body) ? body[index] : body
                        });
                        if (ticket.channel === "facebook") {
                            await (0, facebookMessageListener_1.verifyMessageMedia)(sentMedia, ticket, ticket.contact, true);
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                //limpar arquivo nao utilizado mais após envio
                const filePath = path_1.default.resolve("public", `company${companyId}`, media.filename);
                const fileExists = fs_1.default.existsSync(filePath);
                if (fileExists && isPrivate === "false") {
                    fs_1.default.unlinkSync(filePath);
                }
            }));
        }
        else {
            if (ticket.channel === "whatsapp" && isPrivate === "false") {
                await (0, SendWhatsAppMessage_1.default)({ body, ticket, quotedMsg, vCard });
            }
            else if (ticket.channel === "whatsapp" && isPrivate === "true") {
                const messageData = {
                    wid: `PVT${ticket.updatedAt.toString().replace(' ', '')}`,
                    ticketId: ticket.id,
                    contactId: undefined,
                    body,
                    fromMe: true,
                    mediaType: !(0, lodash_1.isNil)(vCard) ? 'contactMessage' : 'extendedTextMessage',
                    read: true,
                    quotedMsgId: null,
                    ack: 2,
                    remoteJid: ticket.contact?.remoteJid,
                    participant: null,
                    dataJson: null,
                    ticketTrakingId: null,
                    isPrivate: isPrivate === "true"
                };
                await (0, CreateMessageService_1.default)({ messageData, companyId: ticket.companyId });
            }
            else if (["facebook", "instagram"].includes(ticket.channel)) {
                const sendText = await (0, sendFacebookMessage_1.default)({ body, ticket, quotedMsg });
                if (ticket.channel === "facebook") {
                    await (0, facebookMessageListener_1.verifyMessageFace)(sendText, body, ticket, ticket.contact, true);
                }
            }
        }
        return res.send();
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
};
exports.store = store;
const forwardMessage = async (req, res) => {
    const { quotedMsg, signMessage, messageId, contactId } = req.body;
    const { id: userId, companyId } = req.user;
    const requestUser = await User_1.default.findByPk(userId);
    if (!messageId || !contactId) {
        return res.status(200).send("MessageId or ContactId not found");
    }
    const message = await (0, ShowMessageService_1.default)(messageId);
    const contact = await (0, ShowContactService_1.default)(contactId, companyId);
    if (!message) {
        return res.status(404).send("Message not found");
    }
    if (!contact) {
        return res.status(404).send("Contact not found");
    }
    const settings = await CompaniesSettings_1.default.findOne({
        where: { companyId }
    });
    const whatsAppConnectionId = await (0, ShowMessageService_1.GetWhatsAppFromMessage)(message);
    if (!whatsAppConnectionId) {
        return res.status(404).send('Whatsapp from message not found');
    }
    const ticket = await (0, ShowTicketService_1.default)(message.ticketId, message.companyId);
    const mutex = new async_mutex_1.Mutex();
    const createTicket = await mutex.runExclusive(async () => {
        const result = await (0, FindOrCreateTicketService_1.default)(contact, ticket?.whatsapp, 0, ticket.companyId, ticket.queueId, requestUser.id, contact.isGroup ? contact : null, "whatsapp", null, true, settings, false, false);
        return result;
    });
    let ticketData;
    if ((0, lodash_1.isNil)(createTicket?.queueId)) {
        ticketData = {
            status: createTicket.isGroup ? "group" : "open",
            userId: requestUser.id,
            queueId: ticket.queueId
        };
    }
    else {
        ticketData = {
            status: createTicket.isGroup ? "group" : "open",
            userId: requestUser.id
        };
    }
    await (0, UpdateTicketService_1.default)({
        ticketData,
        ticketId: createTicket.id,
        companyId: createTicket.companyId
    });
    let body = message.body;
    if (message.mediaType === 'conversation' || message.mediaType === 'extendedTextMessage') {
        await (0, SendWhatsAppMessage_1.default)({ body, ticket: createTicket, quotedMsg, isForwarded: message.fromMe ? false : true });
    }
    else {
        const mediaUrl = message.mediaUrl.replace(`:${process.env.PORT}`, '');
        const fileName = obterNomeEExtensaoDoArquivo(mediaUrl);
        if (body === fileName) {
            body = "";
        }
        const publicFolder = path_1.default.join(__dirname, '..', '..', '..', 'backend', 'public');
        const filePath = path_1.default.join(publicFolder, `company${createTicket.companyId}`, fileName);
        const mediaSrc = {
            fieldname: 'medias',
            originalname: fileName,
            encoding: '7bit',
            mimetype: message.mediaType,
            filename: fileName,
            path: filePath
        };
        await (0, SendWhatsAppMedia_1.default)({ media: mediaSrc, ticket: createTicket, body, isForwarded: message.fromMe ? false : true });
    }
    return res.send();
};
exports.forwardMessage = forwardMessage;
const remove = async (req, res) => {
    const { messageId } = req.params;
    const { companyId } = req.user;
    const message = await (0, DeleteWhatsAppMessage_1.default)(messageId, companyId);
    const io = (0, socket_1.getIO)();
    if (message.isPrivate) {
        await Message_1.default.destroy({
            where: {
                id: message.id
            }
        });
        io.of(String(companyId))
            // .to(message.ticketId.toString())
            .emit(`company-${companyId}-appMessage`, {
            action: "delete",
            message
        });
    }
    io.of(String(companyId))
        // .to(message.ticketId.toString())
        .emit(`company-${companyId}-appMessage`, {
        action: "update",
        message
    });
    return res.send();
};
exports.remove = remove;
const allMe = async (req, res) => {
    const dateStart = req.query.dateStart;
    const dateEnd = req.query.dateEnd;
    const fromMe = req.query.fromMe;
    const { companyId } = req.user;
    const { count } = await (0, ListMessagesServiceAll_1.default)({
        companyId,
        fromMe,
        dateStart,
        dateEnd
    });
    return res.json({ count });
};
exports.allMe = allMe;
const send = async (req, res) => {
    const messageData = req.body;
    const medias = req.files;
    try {
        const authHeader = req.headers.authorization;
        const [, token] = authHeader.split(" ");
        const whatsapp = await Whatsapp_1.default.findOne({ where: { token } });
        const companyId = whatsapp.companyId;
        const company = await (0, ShowPlanCompanyService_1.default)(companyId);
        const sendMessageWithExternalApi = company.plan.useExternalApi;
        if (sendMessageWithExternalApi) {
            if (!whatsapp) {
                throw new Error("Não foi possível realizar a operação");
            }
            if (messageData.number === undefined) {
                throw new Error("O número é obrigatório");
            }
            const number = messageData.number;
            const body = messageData.body;
            if (medias) {
                await Promise.all(medias.map(async (media) => {
                    req.app.get("queues").messageQueue.add("SendMessage", {
                        whatsappId: whatsapp.id,
                        data: {
                            number,
                            body: media.originalname.replace('/', '-'),
                            mediaPath: media.path
                        }
                    }, { removeOnComplete: true, attempts: 3 });
                }));
            }
            else {
                req.app.get("queues").messageQueue.add("SendMessage", {
                    whatsappId: whatsapp.id,
                    data: {
                        number,
                        body
                    }
                }, { removeOnComplete: true, attempts: 3 });
            }
            return res.send({ mensagem: "Mensagem enviada!" });
        }
        return res.status(400).json({ error: 'Essa empresa não tem permissão para usar a API Externa. Entre em contato com o Suporte para verificar nossos planos!' });
    }
    catch (err) {
        console.log(err);
        if (Object.keys(err).length === 0) {
            throw new AppError_1.default("Não foi possível enviar a mensagem, tente novamente em alguns instantes");
        }
        else {
            throw new AppError_1.default(err.message);
        }
    }
};
exports.send = send;
const edit = async (req, res) => {
    const { messageId } = req.params;
    const { companyId } = req.user;
    const { body } = req.body;
    const { ticket, message } = await (0, EditWhatsAppMessage_1.default)({ messageId, body });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        // .to(String(ticket.id))
        .emit(`company-${companyId}-appMessage`, {
        action: "update",
        message
    });
    io.of(String(companyId))
        // .to(ticket.status)
        // .to("notification")
        // .to(String(ticket.id))
        .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
    });
    return res.send();
};
exports.edit = edit;
const sendMessageFlow = async (whatsappId, body, req, files) => {
    const messageData = body;
    const medias = files;
    try {
        const whatsapp = await Whatsapp_1.default.findByPk(whatsappId);
        if (!whatsapp) {
            throw new Error("Não foi possível realizar a operação");
        }
        if (messageData.number === undefined) {
            throw new Error("O número é obrigatório");
        }
        const numberToTest = messageData.number;
        const body = messageData.body;
        const companyId = messageData.companyId;
        const CheckValidNumber = await (0, CheckNumber_1.default)(numberToTest, companyId);
        const number = CheckValidNumber.replace(/\D/g, "");
        if (medias) {
            await Promise.all(medias.map(async (media) => {
                await req.app.get("queues").messageQueue.add("SendMessage", {
                    whatsappId,
                    data: {
                        number,
                        body: media.originalname,
                        mediaPath: media.path
                    }
                }, { removeOnComplete: true, attempts: 3 });
            }));
        }
        else {
            req.app.get("queues").messageQueue.add("SendMessage", {
                whatsappId,
                data: {
                    number,
                    body
                }
            }, { removeOnComplete: false, attempts: 3 });
        }
        return "Mensagem enviada";
    }
    catch (err) {
        if (Object.keys(err).length === 0) {
            throw new AppError_1.default("Não foi possível enviar a mensagem, tente novamente em alguns instantes");
        }
        else {
            throw new AppError_1.default(err.message);
        }
    }
};
exports.sendMessageFlow = sendMessageFlow;
