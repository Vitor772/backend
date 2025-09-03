"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsWebhookFacebookService = void 0;
const Chatbot_1 = __importDefault(require("../../../models/Chatbot"));
const Contact_1 = __importDefault(require("../../../models/Contact"));
const Queue_1 = __importDefault(require("../../../models/Queue"));
const Ticket_1 = __importDefault(require("../../../models/Ticket"));
const Whatsapp_1 = __importDefault(require("../../../models/Whatsapp"));
const ShowTicketService_1 = __importDefault(require("../../TicketServices/ShowTicketService"));
const graphAPI_1 = require("../graphAPI");
const Mustache_1 = __importDefault(require("../../../helpers/Mustache"));
const mime_1 = __importDefault(require("mime"));
const path_1 = __importDefault(require("path"));
const socket_1 = require("../../../libs/socket");
const randomizador_1 = require("../../../utils/randomizador");
const CreateLogTicketService_1 = __importDefault(require("../../TicketServices/CreateLogTicketService"));
const UpdateTicketService_1 = __importDefault(require("../../TicketServices/UpdateTicketService"));
const FindOrCreateATicketTrakingService_1 = __importDefault(require("../../TicketServices/FindOrCreateATicketTrakingService"));
const ShowQueueService_1 = __importDefault(require("../../QueueService/ShowQueueService"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const os = require("os");
let ffmpegPath;
if (os.platform() === "win32") {
    // Windows
    ffmpegPath = "C:\\ffmpeg\\ffmpeg.exe"; // Substitua pelo caminho correto no Windows
}
else if (os.platform() === "darwin") {
    // macOS
    ffmpegPath = "/opt/homebrew/bin/ffmpeg"; // Substitua pelo caminho correto no macOS
}
else {
    // Outros sistemas operacionais (Linux, etc.)
    ffmpegPath = "/usr/bin/ffmpeg"; // Substitua pelo caminho correto em sistemas Unix-like
}
fluent_ffmpeg_1.default.setFfmpegPath(ffmpegPath);
const ActionsWebhookFacebookService = async (token, idFlowDb, companyId, nodes, connects, nextStage, dataWebhook, details, hashWebhookId, pressKey, idTicket, numberPhrase) => {
    const io = (0, socket_1.getIO)();
    let next = nextStage;
    let createFieldJsonName = "";
    const connectStatic = connects;
    const lengthLoop = nodes.length;
    const getSession = await Whatsapp_1.default.findOne({
        where: {
            facebookPageUserId: token.facebookPageUserId
        },
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color", "greetingMessage"],
                include: [
                    {
                        model: Chatbot_1.default,
                        as: "chatbots",
                        attributes: ["id", "name", "greetingMessage"]
                    }
                ]
            }
        ],
        order: [
            ["queues", "id", "ASC"],
            ["queues", "chatbots", "id", "ASC"]
        ]
    });
    let execCount = 0;
    let execFn = "";
    let ticket = null;
    let noAlterNext = false;
    let selectedQueueid = null;
    for (var i = 0; i < lengthLoop; i++) {
        let nodeSelected;
        let ticketInit;
        if (idTicket) {
            ticketInit = await Ticket_1.default.findOne({
                where: { id: idTicket }
            });
            if (ticketInit.status === "closed") {
                break;
            }
            else {
                await ticketInit.update({
                    dataWebhook: {
                        status: "process",
                    },
                });
            }
        }
        if (pressKey) {
            if (pressKey === "parar") {
                if (idTicket) {
                    const ticket = await Ticket_1.default.findOne({
                        where: { id: idTicket }
                    });
                    await ticket.update({
                        status: "closed"
                    });
                }
                break;
            }
            if (execFn === "") {
                nodeSelected = {
                    type: "menu"
                };
            }
            else {
                nodeSelected = nodes.filter(node => node.id === execFn)[0];
            }
        }
        else {
            const otherNode = nodes.filter(node => node.id === next)[0];
            if (otherNode) {
                nodeSelected = otherNode;
            }
        }
        if (nodeSelected.type === "ticket") {
            const queue = await (0, ShowQueueService_1.default)(nodeSelected.data.data.id, companyId);
            console.clear();
            console.log("====================================");
            console.log("              TICKET                ");
            console.log("====================================");
            selectedQueueid = queue.id;
            console.log({ selectedQueueid });
            //await updateQueueId(ticket, companyId, queue.id)
        }
        if (nodeSelected.type === "singleBlock") {
            for (var iLoc = 0; iLoc < nodeSelected.data.seq.length; iLoc++) {
                const elementNowSelected = nodeSelected.data.seq[iLoc];
                console.log(elementNowSelected, "elementNowSelected");
                if (elementNowSelected.includes("message")) {
                    // await SendMessageFlow(whatsapp, {
                    //   number: numberClient,
                    //   body: nodeSelected.data.elements.filter(
                    //     item => item.number === elementNowSelected
                    //   )[0].value
                    // });
                    const bodyFor = nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value;
                    const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
                    const contact = await Contact_1.default.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });
                    const bodyBot = (0, Mustache_1.default)(`${bodyFor}`, ticket);
                    await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_on");
                    await intervalWhats("5");
                    const sentMessage = await (0, graphAPI_1.sendText)(contact.number, bodyBot, getSession.facebookUserToken);
                    await ticketDetails.update({
                        lastMessage: (0, Mustache_1.default)(bodyFor, ticket.contact)
                    });
                    await updateQueueId(ticket, companyId, selectedQueueid);
                    await intervalWhats("1");
                    await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_off");
                }
                if (elementNowSelected.includes("interval")) {
                    await intervalWhats(nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value);
                }
                if (elementNowSelected.includes("img")) {
                    const mediaPath = process.env.BACKEND_URL === "https://localhost:8090"
                        ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`
                        : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`;
                    const contact = await Contact_1.default.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });
                    // Obtendo o tipo do arquivo
                    const fileExtension = path_1.default.extname(mediaPath);
                    //Obtendo o nome do arquivo sem a extensão
                    const fileNameWithoutExtension = path_1.default.basename(mediaPath, fileExtension);
                    //Obtendo o tipo do arquivo
                    const mimeType = mime_1.default.lookup(mediaPath);
                    const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`;
                    await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_on");
                    await intervalWhats("5");
                    const sendMessage = await (0, graphAPI_1.sendAttachmentFromUrl)(contact.number, domain, "image", getSession.facebookUserToken);
                    const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
                    await ticketDetails.update({
                        lastMessage: (0, Mustache_1.default)(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
                    });
                    await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_off");
                }
                if (elementNowSelected.includes("audio")) {
                    const mediaDirectory = process.env.BACKEND_URL === "https://localhost:8090"
                        ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`
                        : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`;
                    const contact = await Contact_1.default.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });
                    // Obtendo o tipo do arquivo
                    const fileExtension = path_1.default.extname(mediaDirectory);
                    //Obtendo o nome do arquivo sem a extensão
                    const fileNameWithoutExtension = path_1.default.basename(mediaDirectory, fileExtension);
                    //Obtendo o tipo do arquivo
                    const mimeType = mime_1.default.lookup(mediaDirectory);
                    const fileNotExists = path_1.default.resolve(__dirname, "..", "..", "..", "..", "public", fileNameWithoutExtension + ".mp4");
                    if (fileNotExists) {
                        const folder = path_1.default.resolve(__dirname, "..", "..", "..", "..", "public", fileNameWithoutExtension + fileExtension);
                        await convertAudio(folder);
                    }
                    const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}.mp4`;
                    await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_on");
                    await intervalWhats("5");
                    const sendMessage = await (0, graphAPI_1.sendAttachmentFromUrl)(contact.number, domain, "audio", getSession.facebookUserToken);
                    const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
                    await ticketDetails.update({
                        lastMessage: (0, Mustache_1.default)(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
                    });
                    await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_off");
                }
                if (elementNowSelected.includes("video")) {
                    const mediaDirectory = process.env.BACKEND_URL === "https://localhost:8090"
                        ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`
                        : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.elements.filter(item => item.number === elementNowSelected)[0].value}`;
                    const contact = await Contact_1.default.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });
                    // Obtendo o tipo do arquivo
                    const fileExtension = path_1.default.extname(mediaDirectory);
                    //Obtendo o nome do arquivo sem a extensão
                    const fileNameWithoutExtension = path_1.default.basename(mediaDirectory, fileExtension);
                    //Obtendo o tipo do arquivo
                    const mimeType = mime_1.default.lookup(mediaDirectory);
                    const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`;
                    await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_on");
                    const sendMessage = await (0, graphAPI_1.sendAttachmentFromUrl)(contact.number, domain, "video", getSession.facebookUserToken);
                    const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
                    await ticketDetails.update({
                        lastMessage: (0, Mustache_1.default)(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
                    });
                    await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_off");
                }
            }
        }
        if (nodeSelected.type === "img") {
            const mediaPath = process.env.BACKEND_URL === "https://localhost:8090"
                ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.url}`
                : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.url}`;
            // Obtendo o tipo do arquivo
            const fileExtension = path_1.default.extname(mediaPath);
            //Obtendo o nome do arquivo sem a extensão
            const fileNameWithoutExtension = path_1.default.basename(mediaPath, fileExtension);
            //Obtendo o tipo do arquivo
            const mimeType = mime_1.default.lookup(mediaPath);
            const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`;
            const contact = await Contact_1.default.findOne({
                where: { number: numberPhrase.number, companyId }
            });
            await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_on");
            await intervalWhats("5");
            const sendMessage = await (0, graphAPI_1.sendAttachmentFromUrl)(contact.number, domain, "image", getSession.facebookUserToken);
            const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
            await ticketDetails.update({
                lastMessage: (0, Mustache_1.default)(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
            });
            await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_off");
        }
        if (nodeSelected.type === "audio") {
            const mediaDirectory = process.env.BACKEND_URL === "https://localhost:8090"
                ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.url}`
                : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.url}`;
            const contact = await Contact_1.default.findOne({
                where: { number: numberPhrase.number, companyId }
            });
            // Obtendo o tipo do arquivo
            const fileExtension = path_1.default.extname(mediaDirectory);
            //Obtendo o nome do arquivo sem a extensão
            const fileNameWithoutExtension = path_1.default.basename(mediaDirectory, fileExtension);
            //Obtendo o tipo do arquivo
            const mimeType = mime_1.default.lookup(mediaDirectory);
            const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`;
            const sendMessage = await (0, graphAPI_1.sendAttachmentFromUrl)(contact.number, domain, "audio", getSession.facebookUserToken);
            const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
            await ticketDetails.update({
                lastMessage: (0, Mustache_1.default)(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
            });
            await intervalWhats("1");
        }
        if (nodeSelected.type === "interval") {
            await intervalWhats(nodeSelected.data.sec);
        }
        if (nodeSelected.type === "video") {
            const mediaDirectory = process.env.BACKEND_URL === "https://localhost:8090"
                ? `${__dirname.split("src")[0].split("\\").join("/")}public/${nodeSelected.data.url}`
                : `${__dirname.split("dist")[0].split("\\").join("/")}public/${nodeSelected.data.url}`;
            const contact = await Contact_1.default.findOne({
                where: { number: numberPhrase.number, companyId }
            });
            // Obtendo o tipo do arquivo
            const fileExtension = path_1.default.extname(mediaDirectory);
            //Obtendo o nome do arquivo sem a extensão
            const fileNameWithoutExtension = path_1.default.basename(mediaDirectory, fileExtension);
            //Obtendo o tipo do arquivo
            const mimeType = mime_1.default.lookup(mediaDirectory);
            const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`;
            await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_on");
            const sendMessage = await (0, graphAPI_1.sendAttachmentFromUrl)(contact.number, domain, "video", getSession.facebookUserToken);
            const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
            await ticketDetails.update({
                lastMessage: (0, Mustache_1.default)(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact),
            });
            await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_off");
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
                if (isNodeExist.length > 0) {
                    isMenu = isNodeExist[0].type === "menu" ? true : false;
                }
                else {
                    isMenu = false;
                }
            }
            else {
                let optionsMenu = "";
                nodeSelected.data.arrayOption.map(item => {
                    optionsMenu += `[${item.number}] ${item.value}\n`;
                });
                const menuCreate = `${nodeSelected.data.message}\n\n${optionsMenu}`;
                let msg;
                const ticketDetails = await (0, ShowTicketService_1.default)(ticket.id, companyId);
                //await CreateMessageService({ messageData: messageData, companyId });
                //await SendWhatsAppMessage({ body: bodyFor, ticket: ticketDetails, quotedMsg: null })
                // await SendMessage(whatsapp, {
                //   number: numberClient,
                //   body: msg.body
                // });
                await ticketDetails.update({
                    lastMessage: (0, Mustache_1.default)(menuCreate, ticket.contact)
                });
                const contact = await Contact_1.default.findOne({
                    where: { number: numberPhrase.number, companyId }
                });
                await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_on");
                await intervalWhats("5");
                await (0, graphAPI_1.sendText)(numberPhrase.number, menuCreate, getSession.facebookUserToken);
                await (0, graphAPI_1.showTypingIndicator)(contact.number, getSession.facebookUserToken, "typing_off");
                ticket = await Ticket_1.default.findOne({
                    where: { id: idTicket, companyId: companyId }
                });
                await ticket.update({
                    status: "pending",
                    queueId: ticket.queueId ? ticket.queueId : null,
                    userId: null,
                    companyId: companyId,
                    flowWebhook: true,
                    lastFlowId: nodeSelected.id,
                    dataWebhook: dataWebhook,
                    hashFlowId: hashWebhookId,
                    flowStopped: idFlowDb.toString()
                });
                break;
            }
        }
        let isContinue = false;
        if (pressKey === "999" && execCount > 0) {
            pressKey = undefined;
            let result = connects.filter(connect => connect.source === execFn)[0];
            if (typeof result === "undefined") {
                next = "";
            }
            else {
                if (!noAlterNext) {
                    await ticket.reload();
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
                console.log(512, "ActionsWebhookFacebookService");
            }
            if (typeof result === "undefined") {
                console.log(517, "ActionsWebhookFacebookService");
                next = "";
            }
            else {
                if (!noAlterNext) {
                    console.log(520, "ActionsWebhookFacebookService");
                    next = result.target;
                }
            }
        }
        if (!pressKey && !isContinue) {
            const nextNode = connects.filter(connect => connect.source === nodeSelected.id).length;
            console.log(530, "ActionsWebhookFacebookService");
            if (nextNode === 0) {
                console.log(532, "ActionsWebhookFacebookService");
                const ticket = await Ticket_1.default.findOne({
                    where: { id: idTicket, companyId: companyId }
                });
                await ticket.update({
                    lastFlowId: null,
                    dataWebhook: {
                        status: "process",
                    },
                    queueId: ticket.queueId ? ticket.queueId : null,
                    hashFlowId: null,
                    flowWebhook: false,
                    flowStopped: idFlowDb.toString()
                });
                await ticket.reload();
                break;
            }
        }
        isContinue = false;
        if (next === "") {
            break;
        }
        ticket = await Ticket_1.default.findOne({
            where: { id: idTicket, companyId: companyId }
        });
        await ticket.update({
            queueId: null,
            userId: null,
            companyId: companyId,
            flowWebhook: true,
            lastFlowId: nodeSelected.id,
            dataWebhook: dataWebhook,
            hashFlowId: hashWebhookId,
            flowStopped: idFlowDb.toString()
        });
        noAlterNext = false;
        execCount++;
    }
    return "ds";
};
exports.ActionsWebhookFacebookService = ActionsWebhookFacebookService;
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
const intervalWhats = (time) => {
    const seconds = parseInt(time) * 1000;
    return new Promise(resolve => setTimeout(resolve, seconds));
};
const replaceMessages = (message, details, dataWebhook, dataNoWebhook) => {
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
async function updateQueueId(ticket, companyId, queueId) {
    await ticket.update({
        status: 'pending',
        queueId: queueId,
        userId: ticket.userId,
        companyId: companyId,
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
            queueId: queueId
        },
        ticketId: ticket.id,
        companyId
    });
    await (0, CreateLogTicketService_1.default)({
        ticketId: ticket.id,
        type: "queue",
        queueId: queueId
    });
}
function convertAudio(inputFile) {
    let outputFile;
    if (inputFile.endsWith(".mp3")) {
        outputFile = inputFile.replace(".mp3", ".mp4");
    }
    console.log("output", outputFile);
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(inputFile)
            .toFormat('mp4')
            .save(outputFile)
            .on('end', () => {
            resolve(outputFile);
        })
            .on('error', (err) => {
            console.error('Error during conversion:', err);
            reject(err);
        });
    });
}
