"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketByRemoteJid = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const sequelize_1 = require("sequelize");
const socket_1 = require("../libs/socket");
const Contact_1 = __importDefault(require("../models/Contact"));
const User_1 = __importDefault(require("../models/User"));
const Queue_1 = __importDefault(require("../models/Queue"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const Tag_1 = __importDefault(require("../models/Tag"));
const updateTicketByRemoteJid = async (remoteJid, queue, user, statusText, unread) => {
    const { rows: messages } = await Message_1.default.findAndCountAll({
        limit: 1,
        order: [["createdAt", "DESC"]],
        where: {
            remoteJid: {
                [sequelize_1.Op.like]: `%${remoteJid}%`
            }
        }
    });
    messages.forEach(async (message) => {
        let ticketId = message.ticketId;
        let ticket = await Ticket_1.default.findOne({
            where: { id: ticketId },
            include: [
                {
                    model: Contact_1.default,
                    as: "contact",
                    attributes: ["id", "name", "number", "profilePicUrl", "companyId", "urlPicture"],
                    include: ["extraInfo", "tags",
                        {
                            association: "wallets",
                            attributes: ["id", "name"]
                        }]
                },
                {
                    model: User_1.default,
                    as: "user",
                    attributes: ["id", "name"]
                },
                {
                    model: Queue_1.default,
                    as: "queue",
                    attributes: ["id", "name", "color"]
                },
                {
                    model: Whatsapp_1.default,
                    as: "whatsapp",
                    attributes: ["name"]
                },
                {
                    model: Tag_1.default,
                    as: "tags",
                    attributes: ["id", "name", "color"]
                }
            ]
        });
        const oldStatus = ticket.status;
        const oldUserId = ticket.user?.id;
        await ticket.update({ status: statusText, queueId: queue, userId: user, unreadMessages: unread });
        const io = (0, socket_1.getIO)();
        // io.to(oldStatus).emit(`company-${ticket.companyId}-ticket`, {
        //   action: "delete",
        //   ticketId: ticket.id
        // });
        io.of(ticket.companyId.toString())
            // .to(ticket.id.toString())
            .emit(`company-${ticket.companyId}-ticket`, {
            action: "update",
            ticket
        });
    });
    return;
};
exports.updateTicketByRemoteJid = updateTicketByRemoteJid;
