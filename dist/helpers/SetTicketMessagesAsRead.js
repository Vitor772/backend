"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = __importDefault(require("../libs/cache"));
const socket_1 = require("../libs/socket");
const Message_1 = __importDefault(require("../models/Message"));
const logger_1 = __importDefault(require("../utils/logger"));
const GetTicketWbot_1 = __importDefault(require("./GetTicketWbot"));
const ShowWhatsAppService_1 = __importDefault(require("../services/WhatsappService/ShowWhatsAppService"));
const SetTicketMessagesAsRead = async (ticket) => {
    if (ticket.whatsappId) {
        // console.log("SETTING MESSAGES AS READ", ticket.whatsappId)
        const whatsapp = await (0, ShowWhatsAppService_1.default)(ticket.whatsappId, ticket.companyId);
        if (["open", "group"].includes(ticket.status) && whatsapp && whatsapp.status === 'CONNECTED' && ticket.unreadMessages > 0) {
            try {
                const wbot = await (0, GetTicketWbot_1.default)(ticket);
                // no baileys temos que marcar cada mensagem como lida
                // não o chat inteiro como é feito no legacy
                const getJsonMessage = await Message_1.default.findAll({
                    where: {
                        ticketId: ticket.id,
                        fromMe: false,
                        read: false
                    },
                    order: [["createdAt", "DESC"]]
                });
                if (getJsonMessage.length > 0) {
                    getJsonMessage.forEach(async (message) => {
                        const msg = JSON.parse(message.dataJson);
                        if (msg.key && msg.key.fromMe === false && !ticket.isBot && (ticket.userId || ticket.isGroup)) {
                            await wbot.readMessages([msg.key]);
                        }
                    });
                }
                await Message_1.default.update({ read: true }, {
                    where: {
                        ticketId: ticket.id,
                        read: false
                    }
                });
                await ticket.update({ unreadMessages: 0 });
                await cache_1.default.set(`contacts:${ticket.contactId}:unreads`, "0");
                const io = (0, socket_1.getIO)();
                io.of(ticket.companyId.toString())
                    // .to(ticket.status).to("notification")
                    .emit(`company-${ticket.companyId}-ticket`, {
                    action: "updateUnread",
                    ticketId: ticket.id
                });
            }
            catch (err) {
                logger_1.default.warn(`Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`);
            }
        }
    }
};
exports.default = SetTicketMessagesAsRead;
