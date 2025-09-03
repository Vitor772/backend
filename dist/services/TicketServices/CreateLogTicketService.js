"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import AppError from "../../errors/AppError";
// import socketEmit from "../../helpers/socketEmit";
const LogTicket_1 = __importDefault(require("../../models/LogTicket"));
const CreateLogTicketService = async ({ type, userId, ticketId, queueId }) => {
    await LogTicket_1.default.create({
        userId,
        ticketId,
        type,
        queueId
    });
    // socketEmit({
    //   companyId,
    //   type: "ticket:update",
    //   payload: ticket
    // });
};
exports.default = CreateLogTicketService;
