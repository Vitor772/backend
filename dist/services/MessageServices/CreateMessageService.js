"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("../../libs/socket");
const Contact_1 = __importDefault(require("../../models/Contact"));
const Message_1 = __importDefault(require("../../models/Message"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const User_1 = __importDefault(require("../../models/User"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const CreateMessageService = async ({ messageData, companyId }) => {
    await Message_1.default.upsert({ ...messageData, companyId });
    const message = await Message_1.default.findOne({
        where: {
            wid: messageData.wid,
            companyId
        },
        include: [
            "contact",
            {
                model: Ticket_1.default,
                as: "ticket",
                include: [
                    {
                        model: Contact_1.default,
                        attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId"],
                        include: ["extraInfo", "tags"]
                    },
                    {
                        model: Queue_1.default,
                        attributes: ["id", "name", "color"]
                    },
                    {
                        model: Whatsapp_1.default,
                        attributes: ["id", "name", "groupAsTicket"]
                    },
                    {
                        model: User_1.default,
                        attributes: ["id", "name"]
                    },
                    {
                        model: Tag_1.default,
                        as: "tags",
                        attributes: ["id", "name", "color"]
                    }
                ]
            },
            {
                model: Message_1.default,
                as: "quotedMsg",
                include: ["contact"]
            }
        ]
    });
    if (message.ticket.queueId !== null && message.queueId === null) {
        await message.update({ queueId: message.ticket.queueId });
    }
    if (message.isPrivate) {
        await message.update({ wid: `PVT${message.id}` });
    }
    if (!message) {
        throw new Error("ERR_CREATING_MESSAGE");
    }
    const io = (0, socket_1.getIO)();
    if (!messageData?.ticketImported) {
        // console.log("emitiu socket 96", message.ticketId)
        io.of(String(companyId))
            // .to(message.ticketId.toString())
            // .to(message.ticket.status)
            // .to("notification")
            .emit(`company-${companyId}-appMessage`, {
            action: "create",
            message,
            ticket: message.ticket,
            contact: message.ticket.contact
        });
    }
    return message;
};
exports.default = CreateMessageService;
