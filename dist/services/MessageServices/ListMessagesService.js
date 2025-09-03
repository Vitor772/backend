"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Message_1 = __importDefault(require("../../models/Message"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const sequelize_1 = require("sequelize");
const lodash_1 = require("lodash");
const isQueueIdHistoryBlocked_1 = __importDefault(require("../UserServices/isQueueIdHistoryBlocked"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const ListMessagesService = async ({ pageNumber = "1", ticketId, companyId, queues = [], user }) => {
    if (!isNaN(Number(ticketId))) {
        const uuid = await Ticket_1.default.findOne({
            where: {
                id: ticketId,
                companyId
            },
            attributes: ["uuid"]
        });
        ticketId = uuid.uuid;
    }
    const ticket = await Ticket_1.default.findOne({
        where: {
            uuid: ticketId,
            companyId
        }
    });
    const ticketsFilter = [];
    const isAllHistoricEnabled = await (0, isQueueIdHistoryBlocked_1.default)({ userRequest: user.id });
    let ticketIds = [];
    if (!isAllHistoricEnabled) {
        ticketIds = await Ticket_1.default.findAll({
            where: {
                id: { [sequelize_1.Op.lte]: ticket.id },
                companyId: ticket.companyId,
                contactId: ticket.contactId,
                whatsappId: ticket.whatsappId,
                isGroup: ticket.isGroup,
                queueId: user.profile === "admin" || user.allTicket === "enable" || (ticket.isGroup && user.allowGroup) ?
                    {
                        [sequelize_1.Op.or]: [queues, null]
                    } :
                    { [sequelize_1.Op.in]: queues },
            },
            attributes: ["id"]
        });
    }
    else {
        ticketIds = await Ticket_1.default.findAll({
            where: {
                id: { [sequelize_1.Op.lte]: ticket.id },
                companyId: ticket.companyId,
                contactId: ticket.contactId,
                whatsappId: ticket.whatsappId,
                isGroup: ticket.isGroup
            },
            attributes: ["id"]
        });
    }
    if (ticketIds) {
        ticketsFilter.push(ticketIds.map(t => t.id));
    }
    // }
    const tickets = (0, lodash_1.intersection)(...ticketsFilter);
    if (!tickets) {
        throw new AppError_1.default("ERR_NO_TICKET_FOUND", 404);
    }
    // await setMessagesAsRead(ticket);
    const limit = 20;
    const offset = limit * (+pageNumber - 1);
    const { count, rows: messages } = await Message_1.default.findAndCountAll({
        where: { ticketId: tickets, companyId },
        attributes: ["id", "fromMe", "mediaUrl", "body", "mediaType", "dataJson", "ack", "createdAt", "ticketId", "isDeleted", "queueId", "isForwarded", "isEdited", "isPrivate", "companyId"],
        limit,
        include: [
            {
                model: Contact_1.default,
                as: "contact",
                attributes: ["id", "name"],
            },
            {
                model: Message_1.default,
                attributes: ["id", "fromMe", "mediaUrl", "body", "mediaType", "companyId"],
                as: "quotedMsg",
                include: [
                    {
                        model: Contact_1.default,
                        as: "contact",
                        attributes: ["id", "name"],
                    }
                ],
                required: false
            },
            {
                model: Ticket_1.default,
                required: true,
                attributes: ["id", "whatsappId", "queueId"],
                include: [
                    {
                        model: Queue_1.default,
                        as: "queue",
                        attributes: ["id", "name", "color"]
                    }
                ],
            }
        ],
        distinct: true,
        offset,
        subQuery: false,
        order: [["createdAt", "DESC"]]
    });
    const hasMore = count > offset + messages.length;
    return {
        messages: messages.reverse(),
        ticket,
        count,
        hasMore
    };
};
exports.default = ListMessagesService;
