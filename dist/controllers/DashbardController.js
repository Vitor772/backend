"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashTicketsQueues = exports.reportsDay = exports.reportsUsers = exports.index = void 0;
const DashbardDataService_1 = __importDefault(require("../services/ReportService/DashbardDataService"));
const TicketsAttendance_1 = require("../services/ReportService/TicketsAttendance");
const TicketsDayService_1 = require("../services/ReportService/TicketsDayService");
const TicketsQueuesService_1 = __importDefault(require("../services/TicketServices/TicketsQueuesService"));
const index = async (req, res) => {
    const params = req.query;
    const { companyId } = req.user;
    let daysInterval = 3;
    const dashboardData = await (0, DashbardDataService_1.default)(companyId, params);
    return res.status(200).json(dashboardData);
};
exports.index = index;
const reportsUsers = async (req, res) => {
    const { initialDate, finalDate, companyId } = req.query;
    const { data } = await (0, TicketsAttendance_1.TicketsAttendance)({ initialDate, finalDate, companyId });
    return res.json({ data });
};
exports.reportsUsers = reportsUsers;
const reportsDay = async (req, res) => {
    const { initialDate, finalDate, companyId } = req.query;
    const { count, data } = await (0, TicketsDayService_1.TicketsDayService)({ initialDate, finalDate, companyId });
    return res.json({ count, data });
};
exports.reportsDay = reportsDay;
const DashTicketsQueues = async (req, res) => {
    const { companyId, profile, id: userId } = req.user;
    const { dateStart, dateEnd, status, queuesIds, showAll } = req.query;
    const tickets = await (0, TicketsQueuesService_1.default)({
        showAll: profile === "admin" ? showAll : false,
        dateStart,
        dateEnd,
        status,
        queuesIds,
        userId,
        companyId,
        profile
    });
    return res.status(200).json(tickets);
};
exports.DashTicketsQueues = DashTicketsQueues;
