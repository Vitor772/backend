"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sayChatbot = exports.deleteAndCreateDialogStage = void 0;
const ShowDialogChatBotsServices_1 = __importDefault(require("../DialogChatBotsServices/ShowDialogChatBotsServices"));
const ShowQueueService_1 = __importDefault(require("../QueueService/ShowQueueService"));
const ShowChatBotServices_1 = __importDefault(require("../ChatBotServices/ShowChatBotServices"));
const DeleteDialogChatBotsServices_1 = __importDefault(require("../DialogChatBotsServices/DeleteDialogChatBotsServices"));
const ShowChatBotByChatbotIdServices_1 = __importDefault(require("../ChatBotServices/ShowChatBotByChatbotIdServices"));
const CreateDialogChatBotsServices_1 = __importDefault(require("../DialogChatBotsServices/CreateDialogChatBotsServices"));
const ShowWhatsAppService_1 = __importDefault(require("../WhatsappService/ShowWhatsAppService"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const UpdateTicketService_1 = __importDefault(require("../TicketServices/UpdateTicketService"));
const User_1 = __importDefault(require("../../models/User"));
const graphAPI_1 = require("../FacebookServices/graphAPI");
const isNumeric = (value) => /^-?\d+$/.test(value);
const deleteAndCreateDialogStage = async (contact, chatbotId, ticket) => {
    try {
        await (0, DeleteDialogChatBotsServices_1.default)(contact.id);
        const bots = await (0, ShowChatBotByChatbotIdServices_1.default)(chatbotId);
        if (!bots) {
            await ticket.update({ isBot: false });
        }
        return await (0, CreateDialogChatBotsServices_1.default)({
            awaiting: 1,
            contactId: contact.id,
            chatbotId,
            queueId: bots.queueId
        });
    }
    catch (error) {
        await ticket.update({ isBot: false });
    }
};
exports.deleteAndCreateDialogStage = deleteAndCreateDialogStage;
const sendMessage = async (wbot, contact, ticket, body) => {
    const sentMessage = await (0, graphAPI_1.sendText)(contact.number, (0, Mustache_1.default)(body, ticket), ticket.whatsapp.facebookUserToken);
};
const sendDialog = async (choosenQueue, contact, ticket) => {
    const showChatBots = await (0, ShowChatBotServices_1.default)(choosenQueue.id);
    if (showChatBots.options) {
        let options = "";
        showChatBots.options.forEach((option, index) => {
            options += `*${index + 1}* - ${option.name}\n`;
        });
        const optionsBack = options.length > 0
            ? `${options}\n*#* Voltar para o menu principal`
            : options;
        if (options.length > 0) {
            const body = `\u200e${choosenQueue.greetingMessage}\n\n${optionsBack}`;
            // const sendOption = await sendMessage(wbot, contact, ticket, body);
            const sendOption = await (0, graphAPI_1.sendText)(contact.number, (0, Mustache_1.default)(body, ticket), ticket.whatsapp.facebookUserToken);
            return sendOption;
        }
        const body = `\u200e${choosenQueue.greetingMessage}`;
        const send = await (0, graphAPI_1.sendText)(contact.number, (0, Mustache_1.default)(body, ticket), ticket.whatsapp.facebookUserToken);
        return send;
    }
    let options = "";
    showChatBots.options.forEach((option, index) => {
        options += `*${index + 1}* - ${option.name}\n`;
    });
    const optionsBack = options.length > 0
        ? `${options}\n*#* Voltar para o menu principal`
        : options;
    if (options.length > 0) {
        const body = `\u200e${choosenQueue.greetingMessage}\n\n${optionsBack}`;
        const sendOption = await (0, graphAPI_1.sendText)(contact.number, (0, Mustache_1.default)(body, ticket), ticket.whatsapp.facebookUserToken);
        return sendOption;
    }
    const body = `\u200e${choosenQueue.greetingMessage}`;
    const send = await (0, graphAPI_1.sendText)(contact.number, (0, Mustache_1.default)(body, ticket), ticket.whatsapp.facebookUserToken);
    return send;
};
const backToMainMenu = async (wbot, contact, ticket) => {
    await (0, UpdateTicketService_1.default)({
        ticketData: { queueId: null },
        ticketId: ticket.id,
        companyId: ticket.companyId
    });
    // console.log("GETTING WHATSAPP BACK TO MAIN MENU", ticket.whatsappId, wbot.id)
    const { queues, greetingMessage } = await (0, ShowWhatsAppService_1.default)(wbot.id, ticket.companyId);
    let options = "";
    queues.forEach((option, index) => {
        options += `*${index + 1}* - ${option.name}\n`;
    });
    const body = (0, Mustache_1.default)(`\u200e${greetingMessage}\n\n${options}`, ticket);
    await sendMessage(wbot, contact, ticket, body);
    const deleteDialog = await (0, DeleteDialogChatBotsServices_1.default)(contact.id);
    return deleteDialog;
};
const sayChatbot = async (queueId, wbot, ticket, contact, msg) => {
    const selectedOption = msg.text;
    if (!queueId && selectedOption && msg.is_echo)
        return;
    const getStageBot = await (0, ShowDialogChatBotsServices_1.default)(contact.id);
    if (selectedOption === "#") {
        const backTo = await backToMainMenu(wbot, contact, ticket);
        return backTo;
    }
    if (!getStageBot) {
        const queue = await (0, ShowQueueService_1.default)(queueId, ticket.companyId);
        const selectedOption = msg.text;
        const choosenQueue = queue.chatbots[+selectedOption - 1];
        if (!choosenQueue?.greetingMessage) {
            await (0, DeleteDialogChatBotsServices_1.default)(contact.id);
            return;
        } // nao tem mensagem de boas vindas
        if (choosenQueue) {
            if (choosenQueue.isAgent) {
                const getUserByName = await User_1.default.findOne({
                    where: {
                        name: choosenQueue.name
                    }
                });
                const ticketUpdateAgent = {
                    ticketData: {
                        userId: getUserByName.id,
                        status: "open",
                    },
                    ticketId: ticket.id,
                    companyId: ticket.companyId
                };
                await (0, UpdateTicketService_1.default)(ticketUpdateAgent);
            }
            await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
            const send = await sendDialog(choosenQueue, contact, ticket);
            return send;
        }
    }
    if (getStageBot) {
        const selected = isNumeric(selectedOption) ? selectedOption : 1;
        const bots = await (0, ShowChatBotServices_1.default)(getStageBot.chatbotId);
        const choosenQueue = bots.options[+selected - 1]
            ? bots.options[+selected - 1]
            : bots.options[0];
        if (!choosenQueue.greetingMessage) {
            await (0, DeleteDialogChatBotsServices_1.default)(contact.id);
            return;
        } // nao tem mensagem de boas vindas
        if (choosenQueue) {
            if (choosenQueue.isAgent) {
                const getUserByName = await User_1.default.findOne({
                    where: {
                        name: choosenQueue.name
                    }
                });
                const ticketUpdateAgent = {
                    ticketData: {
                        userId: getUserByName.id,
                        status: "open"
                    },
                    ticketId: ticket.id,
                    companyId: ticket.companyId
                };
                await (0, UpdateTicketService_1.default)(ticketUpdateAgent);
            }
            await (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
            const send = await sendDialog(choosenQueue, contact, ticket);
            return send;
        }
    }
};
exports.sayChatbot = sayChatbot;
