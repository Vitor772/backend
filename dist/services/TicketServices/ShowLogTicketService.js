"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LogTicket_1 = __importDefault(require("../../models/LogTicket"));
const User_1 = __importDefault(require("../../models/User"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const ShowLogTicketService = async ({ ticketId, companyId }) => {
    const logs = await LogTicket_1.default.findAll({
        where: {
            ticketId
        },
        include: [
            {
                model: User_1.default,
                as: "user",
                attributes: ["id", "name"]
            },
            {
                model: Queue_1.default,
                as: "queue",
                attributes: ["id", "name"]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
    return logs;
};
exports.default = ShowLogTicketService;
