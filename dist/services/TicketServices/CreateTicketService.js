"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const GetDefaultWhatsApp_1 = __importDefault(require("../../helpers/GetDefaultWhatsApp"));
const GetDefaultWhatsAppByUser_1 = __importDefault(require("../../helpers/GetDefaultWhatsAppByUser"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const ShowContactService_1 = __importDefault(require("../ContactServices/ShowContactService"));
const socket_1 = require("../../libs/socket");
const ShowWhatsAppService_1 = __importDefault(require("../WhatsappService/ShowWhatsAppService"));
const CheckContactOpenTickets_1 = __importDefault(require("../../helpers/CheckContactOpenTickets"));
const CreateLogTicketService_1 = __importDefault(require("./CreateLogTicketService"));
const ShowTicketService_1 = __importDefault(require("./ShowTicketService"));
const CreateTicketService = async ({ contactId, status, userId, queueId, companyId, whatsappId = "" }) => {
    const io = (0, socket_1.getIO)();
    let whatsapp;
    let defaultWhatsapp;
    if (whatsappId !== "undefined" && whatsappId !== null && whatsappId !== "") {
        // console.log("GETTING WHATSAPP CREATE TICKETSERVICE", whatsappId)
        whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    }
    defaultWhatsapp = await (0, GetDefaultWhatsAppByUser_1.default)(userId);
    if (whatsapp) {
        defaultWhatsapp = whatsapp;
    }
    if (!defaultWhatsapp)
        defaultWhatsapp = await (0, GetDefaultWhatsApp_1.default)(whatsapp.id, companyId);
    // console.log("defaultWhatsapp", defaultWhatsapp.id, defaultWhatsapp.channel)
    await (0, CheckContactOpenTickets_1.default)(contactId, defaultWhatsapp.id, companyId);
    const { isGroup } = await (0, ShowContactService_1.default)(contactId, companyId);
    let ticket = await Ticket_1.default.create({
        contactId,
        companyId,
        whatsappId: defaultWhatsapp.id,
        channel: defaultWhatsapp.channel,
        isGroup,
        userId,
        isBot: true,
        queueId,
        status: isGroup ? "group" : "open",
        isActiveDemand: true
    });
    // await Ticket.update(
    //   { companyId, queueId, userId, status: isGroup? "group": "open", isBot: true },
    //   { where: { id } }
    // );
    ticket = await (0, ShowTicketService_1.default)(ticket.id, companyId);
    if (!ticket) {
        throw new AppError_1.default("ERR_CREATING_TICKET");
    }
    io.of(String(companyId))
        // .to(ticket.status)
        // .to("notification")
        // .to(ticket.id.toString())
        .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
    });
    await (0, CreateLogTicketService_1.default)({
        userId,
        queueId,
        ticketId: ticket.id,
        type: "create"
    });
    return ticket;
};
exports.default = CreateTicketService;
