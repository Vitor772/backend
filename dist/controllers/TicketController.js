"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeAll = exports.remove = exports.update = exports.showFromUUID = exports.showLog = exports.show = exports.setunredmsg = exports.store = exports.kanban = exports.report = exports.index = void 0;
const socket_1 = require("../libs/socket");
const Ticket_1 = __importDefault(require("../models/Ticket"));
const CreateTicketService_1 = __importDefault(require("../services/TicketServices/CreateTicketService"));
const DeleteTicketService_1 = __importDefault(require("../services/TicketServices/DeleteTicketService"));
const ListTicketsService_1 = __importDefault(require("../services/TicketServices/ListTicketsService"));
const ShowTicketFromUUIDService_1 = __importDefault(require("../services/TicketServices/ShowTicketFromUUIDService"));
const ShowTicketService_1 = __importDefault(require("../services/TicketServices/ShowTicketService"));
const UpdateTicketService_1 = __importDefault(require("../services/TicketServices/UpdateTicketService"));
const ListTicketsServiceKanban_1 = __importDefault(require("../services/TicketServices/ListTicketsServiceKanban"));
const CreateLogTicketService_1 = __importDefault(require("../services/TicketServices/CreateLogTicketService"));
const ShowLogTicketService_1 = __importDefault(require("../services/TicketServices/ShowLogTicketService"));
const ListTicketsServiceReport_1 = __importDefault(require("../services/TicketServices/ListTicketsServiceReport"));
const SetTicketMessagesAsRead_1 = __importDefault(require("../helpers/SetTicketMessagesAsRead"));
const SetTicketMessagesAsUnRead_1 = __importDefault(require("../helpers/SetTicketMessagesAsUnRead"));
const async_mutex_1 = require("async-mutex");
const index = async (req, res) => {
    const { pageNumber, status, date, dateStart, dateEnd, updatedAt, searchParam, showAll, queueIds: queueIdsStringified, tags: tagIdsStringified, users: userIdsStringified, withUnreadMessages, whatsapps: whatsappIdsStringified, statusFilter: statusStringfied, sortTickets, searchOnMessages } = req.query;
    const userId = Number(req.user.id);
    const { companyId } = req.user;
    let queueIds = [];
    let tagsIds = [];
    let usersIds = [];
    let whatsappIds = [];
    let statusFilters = [];
    if (queueIdsStringified) {
        queueIds = JSON.parse(queueIdsStringified);
    }
    if (tagIdsStringified) {
        tagsIds = JSON.parse(tagIdsStringified);
    }
    if (userIdsStringified) {
        usersIds = JSON.parse(userIdsStringified);
    }
    if (whatsappIdsStringified) {
        whatsappIds = JSON.parse(whatsappIdsStringified);
    }
    if (statusStringfied) {
        statusFilters = JSON.parse(statusStringfied);
    }
    const { tickets, count, hasMore } = await (0, ListTicketsService_1.default)({
        searchParam,
        tags: tagsIds,
        users: usersIds,
        pageNumber,
        status,
        date,
        dateStart,
        dateEnd,
        updatedAt,
        showAll,
        userId,
        queueIds,
        withUnreadMessages,
        whatsappIds,
        statusFilters,
        companyId,
        sortTickets,
        searchOnMessages
    });
    return res.status(200).json({ tickets, count, hasMore });
};
exports.index = index;
const report = async (req, res) => {
    const { searchParam, contactId, whatsappId: whatsappIdsStringified, dateFrom, dateTo, status: statusStringified, queueIds: queueIdsStringified, tags: tagIdsStringified, users: userIdsStringified, page: pageNumber, pageSize, onlyRated } = req.query;
    const userId = req.user.id;
    const { companyId } = req.user;
    let queueIds = [];
    let whatsappIds = [];
    let tagsIds = [];
    let usersIds = [];
    let statusIds = [];
    if (statusStringified) {
        statusIds = JSON.parse(statusStringified);
    }
    if (whatsappIdsStringified) {
        whatsappIds = JSON.parse(whatsappIdsStringified);
    }
    if (queueIdsStringified) {
        queueIds = JSON.parse(queueIdsStringified);
    }
    if (tagIdsStringified) {
        tagsIds = JSON.parse(tagIdsStringified);
    }
    if (userIdsStringified) {
        usersIds = JSON.parse(userIdsStringified);
    }
    const { tickets, totalTickets } = await (0, ListTicketsServiceReport_1.default)(companyId, {
        searchParam,
        queueIds,
        tags: tagsIds,
        users: usersIds,
        status: statusIds,
        dateFrom,
        dateTo,
        userId,
        contactId,
        whatsappId: whatsappIds,
        onlyRated: onlyRated
    }, +pageNumber, +pageSize);
    return res.status(200).json({ tickets, totalTickets });
};
exports.report = report;
const kanban = async (req, res) => {
    const { pageNumber, status, date, dateStart, dateEnd, updatedAt, searchParam, showAll, queueIds: queueIdsStringified, tags: tagIdsStringified, users: userIdsStringified, withUnreadMessages } = req.query;
    const userId = req.user.id;
    const { companyId } = req.user;
    let queueIds = [];
    let tagsIds = [];
    let usersIds = [];
    if (queueIdsStringified) {
        queueIds = JSON.parse(queueIdsStringified);
    }
    if (tagIdsStringified) {
        tagsIds = JSON.parse(tagIdsStringified);
    }
    if (userIdsStringified) {
        usersIds = JSON.parse(userIdsStringified);
    }
    const { tickets, count, hasMore } = await (0, ListTicketsServiceKanban_1.default)({
        searchParam,
        tags: tagsIds,
        users: usersIds,
        pageNumber,
        status,
        date,
        dateStart,
        dateEnd,
        updatedAt,
        showAll,
        userId,
        queueIds,
        withUnreadMessages,
        companyId
    });
    return res.status(200).json({ tickets, count, hasMore });
};
exports.kanban = kanban;
const store = async (req, res) => {
    const { contactId, status, userId, queueId, whatsappId } = req.body;
    const { companyId } = req.user;
    const ticket = await (0, CreateTicketService_1.default)({
        contactId,
        status,
        userId,
        companyId,
        queueId,
        whatsappId
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        // .to(ticket.status)
        .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
    });
    return res.status(200).json(ticket);
};
exports.store = store;
const setunredmsg = async (req, res) => {
    const { ticketId } = req.params;
    const { id: userId, companyId } = req.user;
    const ticket = await (0, ShowTicketService_1.default)(ticketId, companyId);
    if (ticket.channel === "whatsapp" && ticket.whatsappId) {
        (0, SetTicketMessagesAsUnRead_1.default)(ticket);
    }
    return res.status(200).json(ticket);
};
exports.setunredmsg = setunredmsg;
const show = async (req, res) => {
    const { ticketId } = req.params;
    const { id: userId, companyId } = req.user;
    const contact = await (0, ShowTicketService_1.default)(ticketId, companyId);
    await (0, CreateLogTicketService_1.default)({
        userId,
        ticketId,
        type: "access"
    });
    return res.status(200).json(contact);
};
exports.show = show;
const showLog = async (req, res) => {
    const { ticketId } = req.params;
    const { id: userId, companyId } = req.user;
    const log = await (0, ShowLogTicketService_1.default)({ ticketId, companyId });
    return res.status(200).json(log);
};
exports.showLog = showLog;
const showFromUUID = async (req, res) => {
    const { uuid } = req.params;
    const { id: userId, companyId } = req.user;
    const ticket = await (0, ShowTicketFromUUIDService_1.default)(uuid, companyId);
    if (ticket.channel === "whatsapp" && ticket.whatsappId && ticket.unreadMessages > 0) {
        (0, SetTicketMessagesAsRead_1.default)(ticket);
    }
    await (0, CreateLogTicketService_1.default)({
        userId,
        ticketId: ticket.id,
        type: "access"
    });
    return res.status(200).json(ticket);
};
exports.showFromUUID = showFromUUID;
const update = async (req, res) => {
    const { ticketId } = req.params;
    const ticketData = req.body;
    const { companyId } = req.user;
    const mutex = new async_mutex_1.Mutex();
    const { ticket } = await mutex.runExclusive(async () => {
        const result = await (0, UpdateTicketService_1.default)({
            ticketData,
            ticketId,
            companyId
        });
        return result;
    });
    return res.status(200).json(ticket);
};
exports.update = update;
const remove = async (req, res) => {
    const { ticketId } = req.params;
    const { id: userId, companyId } = req.user;
    // await ShowTicketService(ticketId, companyId);
    const ticket = await (0, DeleteTicketService_1.default)(ticketId, userId, companyId);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        // .to(ticket.status)
        // .to(ticketId)
        // .to("notification")
        .emit(`company-${companyId}-ticket`, {
        action: "delete",
        ticketId: +ticketId
    });
    return res.status(200).json({ message: "ticket deleted" });
};
exports.remove = remove;
const closeAll = async (req, res) => {
    const { companyId } = req.user;
    const { status } = req.body;
    const io = (0, socket_1.getIO)();
    const { rows: tickets } = await Ticket_1.default.findAndCountAll({
        where: { companyId: companyId, status: status },
        order: [["updatedAt", "DESC"]]
    });
    tickets.forEach(async (ticket) => {
        const ticketData = {
            status: "closed",
            userId: ticket.userId || null,
            queueId: ticket.queueId || null,
            unreadMessages: 0,
            amountUsedBotQueues: 0,
            sendFarewellMessage: false
        };
        await (0, UpdateTicketService_1.default)({ ticketData, ticketId: ticket.id, companyId });
    });
    return res.status(200).json();
};
exports.closeAll = closeAll;
