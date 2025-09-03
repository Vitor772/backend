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
exports.ActionsWebhookService = void 0;
const MessageController_1 = require("../../controllers/MessageController");
const Contact_1 = __importDefault(require("../../models/Contact"));
const SendMessage_1 = require("../../helpers/SendMessage");
const GetDefaultWhatsApp_1 = __importDefault(require("../../helpers/GetDefaultWhatsApp"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const SendWhatsAppMediaFlow_1 = __importStar(require("../WbotServices/SendWhatsAppMediaFlow"));
const randomizador_1 = require("../../utils/randomizador");
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const SetTicketMessagesAsRead_1 = __importDefault(require("../../helpers/SetTicketMessagesAsRead"));
const SendWhatsAppMessage_1 = __importDefault(require("../WbotServices/SendWhatsAppMessage"));
const ShowTicketService_1 = __importDefault(require("../TicketServices/ShowTicketService"));
const randomCode_1 = require("../../utils/randomCode");
const ShowQueueService_1 = __importDefault(require("../QueueService/ShowQueueService"));
const socket_1 = require("../../libs/socket");
const UpdateTicketService_1 = __importDefault(require("../TicketServices/UpdateTicketService"));
const FindOrCreateATicketTrakingService_1 = __importDefault(require("../TicketServices/FindOrCreateATicketTrakingService"));
const logger_1 = __importDefault(require("../../utils/logger"));
const CreateLogTicketService_1 = __importDefault(require("../TicketServices/CreateLogTicketService"));
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const bluebird_1 = require("bluebird");
const typebotListener_1 = __importDefault(require("../TypebotServices/typebotListener"));
const wbot_1 = require("../../libs/wbot");
const OpenAiService_1 = require("../IntegrationsServices/OpenAiService");
const ActionsWebhookService = async (whatsappId, idFlowDb, companyId, nodes, connects, nextStage, dataWebhook, details, hashWebhookId, pressKey, idTicket, numberPhrase = "", msg) => {
    try {
        const io = (0, socket_1.getIO)();
        let next = nextStage;
        console.log("ActionWebhookService | 53", idFlowDb, companyId, nodes, connects, nextStage, dataWebhook, details, hashWebhookId, pressKey, idTicket, numberPhrase);
        let createFieldJsonName = "";
        const connectStatic = connects;
        if (numberPhrase === "") {
            const nameInput = details.inputs.find(item => item.keyValue === "nome");
            nameInput.data.split(",").map(dataN => {
                const lineToData = details.keysFull.find(item => item === dataN);
                let sumRes = "";
                if (!lineToData) {
                    sumRes = dataN;
                }
                else {
                    sumRes = constructJsonLine(lineToData, dataWebhook);
                }
                createFieldJsonName = createFieldJsonName + sumRes;
            });
        }
        else {
            createFieldJsonName = numberPhrase.name;
        }
        let numberClient = "";
        if (numberPhrase === "") {
            const numberInput = details.inputs.find(item => item.keyValue === "celular");
            numberInput.data.split(",").map(dataN => {
                const lineToDataNumber = details.keysFull.find(item => item === dataN);
                let createFieldJsonNumber = "";
                if (!lineToDataNumber) {
                    createFieldJsonNumber = dataN;
                }
                else {
                    createFieldJsonNumber = constructJsonLine(lineToDataNumber, dataWebhook);
                }
                numberClient = numberClient + createFieldJsonNumber;
            });
        }
        else {
            numberClient = numberPhrase.number;
        }
        numberClient = removerNaoLetrasNumeros(numberClient);
        if (numberClient.substring(0, 2) === "55") {
            if (parseInt(numberClient.substring(2, 4)) >= 31) {
                if (numberClient.length === 13) {
                    numberClient =
                        numberClient.substring(0, 4) + numberClient.substring(5, 13);
                }
            }
        }
        let createFieldJsonEmail = "";
        if (numberPhrase === "") {
            const emailInput = details.inputs.find(item => item.keyValue === "email");
            emailInput.data.split(",").map(dataN => {
                const lineToDataEmail = details.keysFull.find(item => item.endsWith("email"));
                let sumRes = "";
                if (!lineToDataEmail) {
                    sumRes = dataN;
                }
                else {
                    sumRes = constructJsonLine(lineToDataEmail, dataWebhook);
                }
                createFieldJsonEmail = createFieldJsonEmail + sumRes;
            });
        }
        else {
            createFieldJsonEmail = numberPhrase.email;
        }
        const lengthLoop = nodes.length;
        const whatsapp = await (0, GetDefaultWhatsApp_1.default)(whatsappId, companyId);
        if (whatsapp.status !== "CONNECTED") {
            return;
        }
        let execCount = 0;
        let execFn = "";
        let ticket = null;
        let noAlterNext = false;
        for (var i = 0; i < lengthLoop; i++) {
            let nodeSelected;
            let ticketInit;
            if (pressKey) {
                console.log("UPDATE2...");
                if (pressKey === "parar") {
                    console.log("UPDATE3...");
                    if (idTicket) {
                        console.log("UPDATE4...");
                        ticketInit = await Ticket_1.default.findOne({
                            where: { id: idTicket, whatsappId }
                        });
                        await ticket.update({
                            status: "closed"
                        });
                    }
                    break;
                }
                if (execFn === "") {
                    console.log("UPDATE5...");
                    nodeSelected = {
                        type: "menu"
                    };
                }
                else {
                    console.log("UPDATE6...");
                    nodeSelected = nodes.filter(node => node.id === execFn)[0];
                }
            }
            else {
                console.log("UPDATE7...");
                const otherNode = nodes.filter(node => node.id === next)[0];
                if (otherNode) {
                    nodeSelected = otherNode;
                }
            }
            if (nodeSelected.type === "message") {
                let msg;
                const webhook = ticket.dataWebhook;
                if (webhook && webhook.hasOwnProperty("variables")) {
                    msg = {
                        body: replaceMessages(webhook, nodeSelected.data.label)
                    };
                }
                else {
                    msg = {
                        body: nodeSelected.data.label
                    };
                }
                await (0, SendMessage_1.SendMessage)(whatsapp, {
                    number: numberClient,
                    body: msg.body
                });
                //TESTE BOTÃO
                //await SendMessageFlow(whatsapp, {
                //  number: numberClient,
                //  body: msg.body
                //} )
                await intervalWhats("1");
            }
            console.log("273");
            if (nodeSelected.type === "typebot") {
                console.log("275");
                const wbot = (0, wbot_1.getWbot)(whatsapp.id);
                await (0, typebotListener_1.default)({
                    wbot: wbot,
                    msg,
                    ticket,
                    typebot: nodeSelected.data.typebotIntegration
                });
            }
            if (nodeSelected.type === "openai") {
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
                const contact = await Contact_1.default.findOne({
                    where: { number: numberClient, companyId }
                });
                const wbot = (0, wbot_1.getWbot)(whatsapp.id);
                const ticketTraking = await (0, FindOrCreateATicketTrakingService_1.default)({
                    ticketId: ticket.id,
                    companyId,
                    userId: null,
                    whatsappId: whatsapp?.id
                });
                await (0, OpenAiService_1.handleOpenAi)(openAiSettings, msg, wbot, ticket, contact, null, ticketTraking);
            }
            if (nodeSelected.type === "question") {
                const webhook = ticket?.dataWebhook;
                const variables = ticket?.dataWebhook?.variables;
                if (!variables || variables === undefined || variables === null) {
                    const { message } = nodeSelected.data.typebotIntegration;
                    const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
                    const bodyFila = (0, Mustache_1.default)(`${message}`, ticket.contact);
                    await (0, bluebird_1.delay)(3000);
                    await (0, SendWhatsAppMediaFlow_1.typeSimulation)(ticket, "composing");
                    await (0, SendWhatsAppMessage_1.default)({
                        body: bodyFila,
                        ticket: ticketDetails,
                        quotedMsg: null
                    });
                    (0, SetTicketMessagesAsRead_1.default)(ticketDetails);
                    await ticketDetails.update({
                        lastMessage: bodyFila
                    });
                    await ticket.update({
                        userId: null,
                        companyId: companyId,
                        lastFlowId: nodeSelected.id,
                        hashFlowId: hashWebhookId,
                        flowStopped: idFlowDb.toString()
                    });
                }
                break;
            }
            if (nodeSelected.type === "ticket") {
                const queueId = nodeSelected.data?.data?.id || nodeSelected.data?.id;
                const queue = await (0, ShowQueueService_1.default)(queueId, companyId);
                await ticket.update({
                    status: "pending",
                    queueId: queue.id,
                    userId: ticket.userId,
                    companyId: companyId,
                    flowWebhook: true,
                    lastFlowId: nodeSelected.id,
                    hashFlowId: hashWebhookId,
                    flowStopped: idFlowDb.toString()
                });
                await (0, FindOrCreateATicketTrakingService_1.default)({
                    ticketId: ticket.id,
                    companyId,
                    whatsappId: ticket.whatsappId,
                    userId: ticket.userId
                });
                await (0, UpdateTicketService_1.default)({
                    ticketData: {
                        status: "pending",
                        queueId: queue.id
                    },
                    ticketId: ticket.id,
                    companyId
                });
                await (0, CreateLogTicketService_1.default)({
                    ticketId: ticket.id,
                    type: "queue",
                    queueId: queue.id
                });
                let settings = await CompaniesSettings_1.default.findOne({
                    where: {
                        companyId: companyId
                    }
                });
                const enableQueuePosition = settings.sendQueuePosition === "enabled";
                if (enableQueuePosition) {
                    const count = await Ticket_1.default.findAndCountAll({
                        where: {
                            userId: null,
                            status: "pending",
                            companyId,
                            queueId: queue.id,
                            whatsappId: whatsapp.id,
                            isGroup: false
                        }
                    });
                    // Lógica para enviar posição da fila de atendimento
                    const qtd = count.count === 0 ? 1 : count.count;
                    const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;
                    const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
                    const bodyFila = (0, Mustache_1.default)(`${msgFila}`, ticket.contact);
                    await (0, bluebird_1.delay)(3000);
                    await (0, SendWhatsAppMediaFlow_1.typeSimulation)(ticket, "composing");
                    await (0, SendWhatsAppMessage_1.default)({
                        body: bodyFila,
                        ticket: ticketDetails,
                        quotedMsg: null
                    });
                    (0, SetTicketMessagesAsRead_1.default)(ticketDetails);
                    await ticketDetails.update({
                        lastMessage: bodyFila
                    });
                }
            }
            if (nodeSelected.type === "singleBlock") {
                for (var iLoc = 0; iLoc < nodeSelected.data.seq.length; iLoc++) {
                    const elementNowSelected = nodeSelected.data.seq[iLoc];
                    ticket = await Ticket_1.default.findOne({
                        where: { id: idTicket, companyId }
                    });
                    if (elementNowSelected.includes("message")) {
                        const bodyFor = nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value;
                        const ticketDetails = await (0, ShowTicketService_1.default)(idTicket, companyId);
                        let msg;
                        const webhook = ticket.dataWebhook;
                        if (webhook && webhook.hasOwnProperty("variables")) {
                            msg = replaceMessages(webhook.variables, bodyFor);
                        }
                        else {
                            msg = bodyFor;
                        }
                        await (0, bluebird_1.delay)(3000);
                        await (0, SendWhatsAppMediaFlow_1.typeSimulation)(ticket, "composing");
                        await (0, SendWhatsAppMessage_1.default)({
                            body: msg,
                            ticket: ticketDetails,
                            quotedMsg: null
                        });
                        (0, SetTicketMessagesAsRead_1.default)(ticketDetails);
                        await ticketDetails.update({
                            lastMessage: (0, Mustache_1.default)(bodyFor, ticket.contact)
                        });
                        await intervalWhats("1");
                    }
                    if (elementNowSelected.includes("interval")) {
                        await intervalWhats(nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value);
                    }
                    if (elementNowSelected.includes("img")) {
                        await (0, SendWhatsAppMediaFlow_1.typeSimulation)(ticket, "composing");
                        await (0, SendMessage_1.SendMessage)(whatsapp, {
                            number: numberClient,
                            body: "",
                            mediaPath: process.env.BACKEND_URL === "https://localhost:8090"
                                ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`
                                : `${__dirname
                                    .split("dist")[0]
                                    .split("\\")
                                    .join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`
                        });
                        await intervalWhats("1");
                    }
                    if (elementNowSelected.includes("audio")) {
                        const mediaDirectory = process.env.BACKEND_URL === "https://localhost:8090"
                            ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`
                            : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`;
                        const ticketInt = await Ticket_1.default.findOne({
                            where: { id: ticket.id }
                        });
                        await (0, SendWhatsAppMediaFlow_1.typeSimulation)(ticket, "recording");
                        await (0, SendWhatsAppMediaFlow_1.default)({
                            media: mediaDirectory,
                            ticket: ticketInt,
                            isRecord: nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].record
                        });
                        //fs.unlinkSync(mediaDirectory.split('.')[0] + 'A.mp3');
                        await intervalWhats("1");
                    }
                    if (elementNowSelected.includes("video")) {
                        const mediaDirectory = process.env.BACKEND_URL === "https://localhost:8090"
                            ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`
                            : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`;
                        const ticketInt = await Ticket_1.default.findOne({
                            where: { id: ticket.id }
                        });
                        await (0, SendWhatsAppMediaFlow_1.typeSimulation)(ticket, "recording");
                        await (0, SendWhatsAppMediaFlow_1.default)({
                            media: mediaDirectory,
                            ticket: ticketInt
                        });
                        //fs.unlinkSync(mediaDirectory.split('.')[0] + 'A.mp3');
                        await intervalWhats("1");
                    }
                }
            }
            let isRandomizer;
            if (nodeSelected.type === "randomizer") {
                const selectedRandom = (0, randomizador_1.randomizarCaminho)(nodeSelected.data.percent / 100);
                const resultConnect = connects.filter(connect => connect.source === nodeSelected.id);
                if (selectedRandom === "A") {
                    next = resultConnect.filter(item => item.sourceHandle === "a")[0]
                        .target;
                    noAlterNext = true;
                }
                else {
                    next = resultConnect.filter(item => item.sourceHandle === "b")[0]
                        .target;
                    noAlterNext = true;
                }
                isRandomizer = true;
            }
            let isMenu;
            if (nodeSelected.type === "menu") {
                console.log(650, "menu");
                if (pressKey) {
                    const filterOne = connectStatic.filter(confil => confil.source === next);
                    const filterTwo = filterOne.filter(filt2 => filt2.sourceHandle === "a" + pressKey);
                    if (filterTwo.length > 0) {
                        execFn = filterTwo[0].target;
                    }
                    else {
                        execFn = undefined;
                    }
                    // execFn =
                    //   connectStatic
                    //     .filter(confil => confil.source === next)
                    //     .filter(filt2 => filt2.sourceHandle === "a" + pressKey)[0]?.target ??
                    //   undefined;
                    if (execFn === undefined) {
                        break;
                    }
                    pressKey = "999";
                    const isNodeExist = nodes.filter(item => item.id === execFn);
                    console.log(674, "menu");
                    if (isNodeExist.length > 0) {
                        isMenu = isNodeExist[0].type === "menu" ? true : false;
                    }
                    else {
                        isMenu = false;
                    }
                }
                else {
                    console.log(681, "menu");
                    let optionsMenu = "";
                    nodeSelected.data.arrayOption.map(item => {
                        optionsMenu += `[${item.number}] ${item.value}\n`;
                    });
                    const menuCreate = `${nodeSelected.data.message}\n\n${optionsMenu}`;
                    const webhook = ticket.dataWebhook;
                    let msg;
                    if (webhook && webhook.hasOwnProperty("variables")) {
                        msg = {
                            body: replaceMessages(webhook, menuCreate),
                            number: numberClient,
                            companyId: companyId
                        };
                    }
                    else {
                        msg = {
                            body: menuCreate,
                            number: numberClient,
                            companyId: companyId
                        };
                    }
                    const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
                    const messageData = {
                        wid: (0, randomCode_1.randomString)(50),
                        ticketId: ticket.id,
                        body: msg.body,
                        fromMe: true,
                        read: true
                    };
                    //await CreateMessageService({ messageData: messageData, companyId });
                    //await SendWhatsAppMessage({ body: bodyFor, ticket: ticketDetails, quotedMsg: null })
                    // await SendMessage(whatsapp, {
                    //   number: numberClient,
                    //   body: msg.body
                    // });
                    await (0, SendWhatsAppMediaFlow_1.typeSimulation)(ticket, "composing");
                    await (0, SendWhatsAppMessage_1.default)({
                        body: msg.body,
                        ticket: ticketDetails,
                        quotedMsg: null
                    });
                    (0, SetTicketMessagesAsRead_1.default)(ticketDetails);
                    await ticketDetails.update({
                        lastMessage: (0, Mustache_1.default)(msg.body, ticket.contact)
                    });
                    await intervalWhats("1");
                    if (ticket) {
                        ticket = await Ticket_1.default.findOne({
                            where: {
                                id: ticket.id,
                                whatsappId: whatsappId,
                                companyId: companyId
                            }
                        });
                    }
                    else {
                        ticket = await Ticket_1.default.findOne({
                            where: {
                                id: idTicket,
                                whatsappId: whatsappId,
                                companyId: companyId
                            }
                        });
                    }
                    if (ticket) {
                        await ticket.update({
                            queueId: ticket.queueId ? ticket.queueId : null,
                            userId: null,
                            companyId: companyId,
                            flowWebhook: true,
                            lastFlowId: nodeSelected.id,
                            dataWebhook: dataWebhook,
                            hashFlowId: hashWebhookId,
                            flowStopped: idFlowDb.toString()
                        });
                    }
                    break;
                }
            }
            let isContinue = false;
            if (pressKey === "999" && execCount > 0) {
                console.log(587, "ActionsWebhookService | 587");
                pressKey = undefined;
                let result = connects.filter(connect => connect.source === execFn)[0];
                if (typeof result === "undefined") {
                    next = "";
                }
                else {
                    if (!noAlterNext) {
                        next = result.target;
                    }
                }
            }
            else {
                let result;
                if (isMenu) {
                    result = { target: execFn };
                    isContinue = true;
                    pressKey = undefined;
                }
                else if (isRandomizer) {
                    isRandomizer = false;
                    result = next;
                }
                else {
                    result = connects.filter(connect => connect.source === next)[0];
                }
                if (typeof result === "undefined") {
                    next = "";
                }
                else {
                    if (!noAlterNext) {
                        next = result.target;
                    }
                }
                console.log(619, "ActionsWebhookService");
            }
            if (!pressKey && !isContinue) {
                const nextNode = connects.filter(connect => connect.source === nodeSelected.id).length;
                console.log(626, "ActionsWebhookService");
                if (nextNode === 0) {
                    console.log(654, "ActionsWebhookService");
                    await Ticket_1.default.findOne({
                        where: { id: idTicket, whatsappId, companyId: companyId }
                    });
                    await ticket.update({
                        lastFlowId: nodeSelected.id,
                        hashFlowId: null,
                        flowWebhook: false,
                        flowStopped: idFlowDb.toString()
                    });
                    break;
                }
            }
            isContinue = false;
            if (next === "") {
                break;
            }
            console.log(678, "ActionsWebhookService");
            console.log("UPDATE10...");
            ticket = await Ticket_1.default.findOne({
                where: { id: idTicket, whatsappId, companyId: companyId }
            });
            if (ticket.status === "closed") {
                io.of(String(companyId))
                    // .to(oldStatus)
                    // .to(ticketId.toString())
                    .emit(`company-${ticket.companyId}-ticket`, {
                    action: "delete",
                    ticketId: ticket.id
                });
            }
            console.log("UPDATE12...");
            await ticket.update({
                whatsappId: whatsappId,
                queueId: ticket?.queueId,
                userId: null,
                companyId: companyId,
                flowWebhook: true,
                lastFlowId: nodeSelected.id,
                hashFlowId: hashWebhookId,
                flowStopped: idFlowDb.toString()
            });
            noAlterNext = false;
            execCount++;
        }
        return "ds";
    }
    catch (error) {
        logger_1.default.error(error);
    }
};
exports.ActionsWebhookService = ActionsWebhookService;
const constructJsonLine = (line, json) => {
    let valor = json;
    const chaves = line.split(".");
    if (chaves.length === 1) {
        return valor[chaves[0]];
    }
    for (const chave of chaves) {
        valor = valor[chave];
    }
    return valor;
};
function removerNaoLetrasNumeros(texto) {
    // Substitui todos os caracteres que não são letras ou números por vazio
    return texto.replace(/[^a-zA-Z0-9]/g, "");
}
const sendMessageWhats = async (whatsId, msg, req) => {
    (0, MessageController_1.sendMessageFlow)(whatsId, msg, req);
    return Promise.resolve();
};
const intervalWhats = (time) => {
    const seconds = parseInt(time) * 1000;
    return new Promise(resolve => setTimeout(resolve, seconds));
};
const replaceMessages = (variables, message) => {
    return message.replace(/{{\s*([^{}\s]+)\s*}}/g, (match, key) => variables[key] || "");
};
const replaceMessagesOld = (message, details, dataWebhook, dataNoWebhook) => {
    const matches = message.match(/\{([^}]+)\}/g);
    if (dataWebhook) {
        let newTxt = message.replace(/{+nome}+/, dataNoWebhook.nome);
        newTxt = newTxt.replace(/{+numero}+/, dataNoWebhook.numero);
        newTxt = newTxt.replace(/{+email}+/, dataNoWebhook.email);
        return newTxt;
    }
    if (matches && matches.includes("inputs")) {
        const placeholders = matches.map(match => match.replace(/\{|\}/g, ""));
        let newText = message;
        placeholders.map(item => {
            const value = details["inputs"].find(itemLocal => itemLocal.keyValue === item);
            const lineToData = details["keysFull"].find(itemLocal => itemLocal.endsWith(`.${value.data}`));
            const createFieldJson = constructJsonLine(lineToData, dataWebhook);
            newText = newText.replace(`{${item}}`, createFieldJson);
        });
        return newText;
    }
    else {
        return message;
    }
};
