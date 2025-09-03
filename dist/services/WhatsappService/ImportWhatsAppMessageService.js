"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeTicketsImported = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const socket_1 = require("../../libs/socket");
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const sequelize_1 = require("sequelize");
const date_fns_1 = require("date-fns");
const UpdateTicketService_1 = __importDefault(require("../TicketServices/UpdateTicketService"));
const wbot_1 = require("../../libs/wbot");
const wbotMessageListener_1 = require("../WbotServices/wbotMessageListener");
const moment_1 = __importDefault(require("moment"));
const addLogs_1 = require("../../helpers/addLogs");
const closeTicketsImported = async (whatsappId) => {
    const tickets = await Ticket_1.default.findAll({
        where: {
            status: 'pending',
            whatsappId,
            imported: { [sequelize_1.Op.lt]: +(0, date_fns_1.add)(new Date(), { hours: +5 }) }
        }
    });
    for (const ticket of tickets) {
        await new Promise(r => setTimeout(r, 330));
        await (0, UpdateTicketService_1.default)({ ticketData: { status: "closed" }, ticketId: ticket.id, companyId: ticket.companyId });
    }
    let whatsApp = await Whatsapp_1.default.findByPk(whatsappId);
    whatsApp.update({ statusImportMessages: null });
    const io = (0, socket_1.getIO)();
    io.of(whatsApp.companyId.toString())
        .emit(`importMessages-${whatsApp.companyId}`, {
        action: "refresh",
    });
};
exports.closeTicketsImported = closeTicketsImported;
function sortByMessageTimestamp(a, b) {
    return b.messageTimestamp - a.messageTimestamp;
}
function cleaner(array) {
    const mapa = new Map();
    const resultado = [];
    for (const objeto of array) {
        const valorChave = objeto['key']['id'];
        if (!mapa.has(valorChave)) {
            mapa.set(valorChave, true);
            resultado.push(objeto);
        }
    }
    return resultado.sort(sortByMessageTimestamp);
}
const ImportWhatsAppMessageService = async (whatsappId) => {
    let whatsApp = await Whatsapp_1.default.findByPk(whatsappId);
    const wbot = (0, wbot_1.getWbot)(whatsApp.id);
    try {
        const io = (0, socket_1.getIO)();
        const messages = cleaner(wbot_1.dataMessages[whatsappId]);
        let dateOldLimit = new Date(whatsApp.importOldMessages).getTime();
        let dateRecentLimit = new Date(whatsApp.importRecentMessages).getTime();
        (0, addLogs_1.addLogs)({
            fileName: `processImportMessagesWppId${whatsappId}.txt`, forceNewFile: true,
            text: `Aguardando conexão para iniciar a importação de mensagens:
    Whatsapp nome: ${whatsApp.name}
    Whatsapp Id: ${whatsApp.id}
    Criação do arquivo de logs: ${(0, moment_1.default)().format("DD/MM/YYYY HH:mm:ss")}
    Selecionado Data de inicio de importação: ${(0, moment_1.default)(dateOldLimit).format("DD/MM/YYYY HH:mm:ss")} 
    Selecionado Data final da importação: ${(0, moment_1.default)(dateRecentLimit).format("DD/MM/YYYY HH:mm:ss")} 
    `
        });
        const qtd = messages.length;
        let i = 0;
        while (i < qtd) {
            try {
                const msg = messages[i];
                (0, addLogs_1.addLogs)({
                    fileName: `processImportMessagesWppId${whatsappId}.txt`, text: `
Mensagem ${i + 1} de ${qtd}
              `
                });
                await (0, wbotMessageListener_1.handleMessage)(msg, wbot, whatsApp.companyId, true);
                if (i % 2 === 0) {
                    const timestampMsg = Math.floor(msg.messageTimestamp["low"] * 1000);
                    io.of(whatsApp.companyId.toString())
                        .emit(`importMessages-${whatsApp.companyId}`, {
                        action: "update",
                        status: { this: i + 1, all: qtd, date: (0, moment_1.default)(timestampMsg).format("DD/MM/YY HH:mm:ss") }
                    });
                }
                if (i + 1 === qtd) {
                    wbot_1.dataMessages[whatsappId] = [];
                    if (whatsApp.closedTicketsPostImported) {
                        await (0, exports.closeTicketsImported)(whatsappId);
                    }
                    await whatsApp.update({
                        statusImportMessages: whatsApp.closedTicketsPostImported ? null : "renderButtonCloseTickets",
                        importOldMessages: null,
                        importRecentMessages: null
                    });
                    io.of(whatsApp.companyId.toString())
                        .emit(`importMessages-${whatsApp.companyId}`, {
                        action: "refresh",
                    });
                }
            }
            catch (error) { }
            i++;
        }
    }
    catch (error) {
        throw new AppError_1.default("ERR_NOT_MESSAGE_TO_IMPORT", 403);
    }
    return "whatsapps";
};
exports.default = ImportWhatsAppMessageService;
