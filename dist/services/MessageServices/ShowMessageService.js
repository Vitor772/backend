"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWhatsAppFromMessage = void 0;
const database_1 = __importDefault(require("../../database"));
const Message_1 = __importDefault(require("../../models/Message"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const ShowMessageService = async (messageId) => {
    const message = await database_1.default.query(`select * from "Messages" where id = '${messageId}'`, {
        model: Message_1.default,
        mapToModel: true
    });
    if (message.length > 0) {
        return message[0];
    }
    return undefined;
};
const GetWhatsAppFromMessage = async (message) => {
    const ticketId = message.ticketId;
    const ticket = await Ticket_1.default.findByPk(ticketId);
    if (!ticket) {
        return null;
    }
    return ticket.whatsappId;
};
exports.GetWhatsAppFromMessage = GetWhatsAppFromMessage;
exports.default = ShowMessageService;
