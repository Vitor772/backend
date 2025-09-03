"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CheckContactOpenTickets_1 = __importDefault(require("../../helpers/CheckContactOpenTickets"));
const GetDefaultWhatsApp_1 = __importDefault(require("../../helpers/GetDefaultWhatsApp"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const socket_1 = require("../../libs/socket");
const CreateTicketServiceWebhook = async ({ contactId, status, userId, queueId, companyId, lastFlowId, dataWebhook, hashFlowId, flowStopped }) => {
    const defaultWhatsapp = await (0, GetDefaultWhatsApp_1.default)(companyId);
    await (0, CheckContactOpenTickets_1.default)(contactId, 0, companyId);
    const isGroup = false;
    const [{ id }] = await Ticket_1.default.findOrCreate({
        where: {
            contactId,
            companyId
        },
        defaults: {
            contactId,
            companyId,
            whatsappId: defaultWhatsapp.id,
            status,
            isGroup,
            userId,
            flowWebhook: true,
            dataWebhook: dataWebhook,
            hashFlowId: hashFlowId,
            flowStopped: flowStopped
        }
    });
    await Ticket_1.default.update({
        companyId,
        queueId,
        userId,
        whatsappId: defaultWhatsapp.id,
        status: "open",
        flowWebhook: true,
        lastFlowId: lastFlowId,
        flowStopped: flowStopped
    }, { where: { id } });
    const ticket = await Ticket_1.default.findByPk(id, { include: ["contact", "queue"] });
    if (!ticket) {
        throw new AppError_1.default("ERR_CREATING_TICKET");
    }
    const io = (0, socket_1.getIO)();
    io.to(ticket.id.toString()).emit("ticket", {
        action: "update",
        ticket
    });
    return ticket;
};
exports.default = CreateTicketServiceWebhook;
