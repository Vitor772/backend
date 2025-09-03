"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsReport = exports.DashTicketsQueues = void 0;
const TicketsQueuesService_1 = __importDefault(require("../services/Statistics/TicketsQueuesService"));
const ContactsReportService_1 = __importDefault(require("../services/Statistics/ContactsReportService"));
const DashTicketsQueues = async (req, res) => {
    const { companyId, profile, id: userId } = req.user;
    const { dateStart, dateEnd, status, queuesIds, showAll } = req.query;
    const tickets = await (0, TicketsQueuesService_1.default)({
        showAll: profile === "admin" ? "true" : false,
        dateStart,
        dateEnd,
        status,
        queuesIds,
        userId,
        companyId
    });
    return res.status(200).json(tickets);
};
exports.DashTicketsQueues = DashTicketsQueues;
const ContactsReport = async (req, res) => {
    const { companyId } = req.user;
    // if (req.user.profile !== "admin") {
    //   throw new AppError("ERR_NO_PERMISSION", 403);
    // }
    const { startDate, endDate, tags, ddds, wallets, searchParam } = req.query;
    const tickets = await (0, ContactsReportService_1.default)({
        startDate,
        endDate,
        tags,
        ddds,
        companyId,
        profile: req.user.profile,
        userId: +req.user.id,
        wallets,
        searchParam
    });
    return res.status(200).json(tickets);
};
exports.ContactsReport = ContactsReport;
