"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Message_1 = __importDefault(require("../../models/Message"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const User_1 = __importDefault(require("../../models/User"));
const ShowUserService_1 = __importDefault(require("../UserServices/ShowUserService"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const lodash_1 = require("lodash");
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ContactTag_1 = __importDefault(require("../../models/ContactTag"));
const remove_accents_1 = __importDefault(require("remove-accents"));
const FindCompanySettingOneService_1 = __importDefault(require("../CompaniesSettings/FindCompanySettingOneService"));
const ListTicketsService = async ({ searchParam = "", pageNumber = "1", queueIds, tags, users, status, date, dateStart, dateEnd, updatedAt, showAll, userId, withUnreadMessages = "false", whatsappIds, statusFilters, companyId, sortTickets = "DESC", searchOnMessages = "false" }) => {
    const user = await (0, ShowUserService_1.default)(userId, companyId);
    const showTicketAllQueues = user.allHistoric === "enabled";
    const showTicketWithoutQueue = user.allTicket === "enable";
    const showGroups = user.allowGroup === true;
    const showPendingNotification = await (0, FindCompanySettingOneService_1.default)({ companyId, column: "showNotificationPending" });
    const showNotificationPendingValue = showPendingNotification[0].showNotificationPending;
    let whereCondition;
    whereCondition = {
        [sequelize_1.Op.or]: [{ userId }, { status: "pending" }],
        queueId: showTicketWithoutQueue ? { [sequelize_1.Op.or]: [queueIds, null] } : { [sequelize_1.Op.or]: [queueIds] },
        companyId
    };
    let includeCondition;
    includeCondition = [
        {
            model: Contact_1.default,
            as: "contact",
            attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId"],
            include: ["extraInfo", "tags"]
        },
        {
            model: Queue_1.default,
            as: "queue",
            attributes: ["id", "name", "color"]
        },
        {
            model: User_1.default,
            as: "user",
            attributes: ["id", "name"]
        },
        {
            model: Tag_1.default,
            as: "tags",
            attributes: ["id", "name", "color"]
        },
        {
            model: Whatsapp_1.default,
            as: "whatsapp",
            attributes: ["id", "name", "expiresTicket", "groupAsTicket"]
        },
    ];
    const userQueueIds = user.queues.map(queue => queue.id);
    if (status === "open") {
        whereCondition = {
            ...whereCondition,
            userId,
            queueId: { [sequelize_1.Op.in]: queueIds }
        };
    }
    else if (status === "group" && user.allowGroup && user.whatsappId) {
        whereCondition = {
            companyId,
            queueId: { [sequelize_1.Op.or]: [queueIds, null] },
            whatsappId: user.whatsappId
        };
    }
    else if (status === "group" && (user.allowGroup) && !user.whatsappId) {
        whereCondition = {
            companyId,
            queueId: { [sequelize_1.Op.or]: [queueIds, null] },
        };
    }
    else if (user.profile === "user" && status === "pending" && showTicketWithoutQueue) {
        const TicketsUserFilter = [];
        let ticketsIds = [];
        if (!showTicketAllQueues) {
            ticketsIds = await Ticket_1.default.findAll({
                where: {
                    userId: { [sequelize_1.Op.or]: [user.id, null] },
                    queueId: { [sequelize_1.Op.or]: [queueIds, null] },
                    status: "pending",
                    companyId
                },
            });
        }
        else {
            ticketsIds = await Ticket_1.default.findAll({
                where: {
                    userId: { [sequelize_1.Op.or]: [user.id, null] },
                    // queueId: { [Op.or]: [queueIds, null] },
                    status: "pending",
                    companyId
                },
            });
        }
        if (ticketsIds) {
            TicketsUserFilter.push(ticketsIds.map(t => t.id));
        }
        // }
        const ticketsIntersection = (0, lodash_1.intersection)(...TicketsUserFilter);
        whereCondition = {
            ...whereCondition,
            id: ticketsIntersection
        };
    }
    else if (user.profile === "user" && status === "pending" && !showTicketWithoutQueue) {
        const TicketsUserFilter = [];
        let ticketsIds = [];
        if (!showTicketAllQueues) {
            ticketsIds = await Ticket_1.default.findAll({
                where: {
                    companyId,
                    userId: { [sequelize_1.Op.or]: [user.id, null] },
                    status: "pending",
                    queueId: { [sequelize_1.Op.in]: queueIds }
                },
            });
        }
        else {
            ticketsIds = await Ticket_1.default.findAll({
                where: {
                    companyId,
                    [sequelize_1.Op.or]: [{
                            userId: { [sequelize_1.Op.or]: [user.id, null] }
                        },
                        {
                            status: "pending"
                        }
                    ],
                    // queueId: { [Op.in] : queueIds},
                    status: "pending"
                },
            });
        }
        if (ticketsIds) {
            TicketsUserFilter.push(ticketsIds.map(t => t.id));
        }
        // }
        const ticketsIntersection = (0, lodash_1.intersection)(...TicketsUserFilter);
        whereCondition = {
            ...whereCondition,
            id: ticketsIntersection
        };
    }
    if (showAll === "true" && (user.profile === "admin" || user.allUserChat === "enabled") && status !== "search") {
        if (user.allHistoric === "enabled" && showTicketWithoutQueue) {
            whereCondition = { companyId };
        }
        else if (user.allHistoric === "enabled" && !showTicketWithoutQueue) {
            whereCondition = { companyId, queueId: { [sequelize_1.Op.ne]: null } };
        }
        else if (user.allHistoric === "disabled" && showTicketWithoutQueue) {
            whereCondition = { companyId, queueId: { [sequelize_1.Op.or]: [queueIds, null] } };
        }
        else if (user.allHistoric === "disabled" && !showTicketWithoutQueue) {
            whereCondition = { companyId, queueId: queueIds };
        }
    }
    if (status && status !== "search") {
        whereCondition = {
            ...whereCondition,
            status: showAll === "true" && status === "pending" ? { [sequelize_1.Op.or]: [status, "lgpd"] } : status
        };
    }
    if (status === "closed") {
        let latestTickets;
        if (!showTicketAllQueues) {
            let whereCondition2 = {
                companyId,
                status: "closed",
            };
            if (showAll === "false" && user.profile === "admin") {
                whereCondition2 = {
                    ...whereCondition2,
                    queueId: queueIds,
                    userId
                };
            }
            else {
                whereCondition2 = {
                    ...whereCondition2,
                    queueId: showAll === "true" || showTicketWithoutQueue ? { [sequelize_1.Op.or]: [queueIds, null] } : queueIds,
                };
            }
            latestTickets = await Ticket_1.default.findAll({
                attributes: ['companyId', 'contactId', 'whatsappId', [(0, sequelize_1.literal)('MAX("id")'), 'id']],
                where: whereCondition2,
                group: ['companyId', 'contactId', 'whatsappId'],
            });
        }
        else {
            let whereCondition2 = {
                companyId,
                status: "closed",
            };
            if (showAll === "false" && (user.profile === "admin" || user.allUserChat === "enabled")) {
                whereCondition2 = {
                    ...whereCondition2,
                    queueId: queueIds,
                    userId
                };
            }
            else {
                whereCondition2 = {
                    ...whereCondition2,
                    queueId: showAll === "true" || showTicketWithoutQueue ? { [sequelize_1.Op.or]: [queueIds, null] } : queueIds,
                };
            }
            latestTickets = await Ticket_1.default.findAll({
                attributes: ['companyId', 'contactId', 'whatsappId', [(0, sequelize_1.literal)('MAX("id")'), 'id']],
                where: whereCondition2,
                group: ['companyId', 'contactId', 'whatsappId'],
            });
        }
        const ticketIds = latestTickets.map((t) => t.id);
        whereCondition = {
            id: ticketIds
        };
    }
    else if (status === "search") {
        whereCondition = {
            companyId
        };
        let latestTickets;
        if (!showTicketAllQueues && user.profile === "user") {
            latestTickets = await Ticket_1.default.findAll({
                attributes: ['companyId', 'contactId', 'whatsappId', [(0, sequelize_1.literal)('MAX("id")'), 'id']],
                where: {
                    [sequelize_1.Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }],
                    queueId: showAll === "true" || showTicketWithoutQueue ? { [sequelize_1.Op.or]: [queueIds, null] } : queueIds,
                    companyId
                },
                group: ['companyId', 'contactId', 'whatsappId'],
            });
        }
        else {
            let whereCondition2 = {
                companyId,
                [sequelize_1.Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }]
            };
            if (showAll === "false" && user.profile === "admin") {
                whereCondition2 = {
                    ...whereCondition2,
                    queueId: queueIds,
                    // [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }],
                };
            }
            else if (showAll === "true" && user.profile === "admin") {
                whereCondition2 = {
                    companyId,
                    queueId: { [sequelize_1.Op.or]: [queueIds, null] },
                    // status: ["pending", "closed", "group"]
                };
            }
            latestTickets = await Ticket_1.default.findAll({
                attributes: ['companyId', 'contactId', 'whatsappId', [(0, sequelize_1.literal)('MAX("id")'), 'id']],
                where: whereCondition2,
                group: ['companyId', 'contactId', 'whatsappId'],
            });
        }
        const ticketIds = latestTickets.map((t) => t.id);
        whereCondition = {
            ...whereCondition,
            id: ticketIds
        };
        // if (date) {
        //   whereCondition = {
        //     createdAt: {
        //       [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
        //     }
        //   };
        // }
        // if (dateStart && dateEnd) {
        //   whereCondition = {
        //     updatedAt: {
        //       [Op.between]: [+startOfDay(parseISO(dateStart)), +endOfDay(parseISO(dateEnd))]
        //     }
        //   };
        // }
        // if (updatedAt) {
        //   whereCondition = {
        //     updatedAt: {
        //       [Op.between]: [
        //         +startOfDay(parseISO(updatedAt)),
        //         +endOfDay(parseISO(updatedAt))
        //       ]
        //     }
        //   };
        // }
        if (searchParam) {
            const sanitizedSearchParam = (0, remove_accents_1.default)(searchParam.toLocaleLowerCase().trim());
            if (searchOnMessages === "true") {
                includeCondition = [
                    ...includeCondition,
                    {
                        model: Message_1.default,
                        as: "messages",
                        attributes: ["id", "body"],
                        where: {
                            body: (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)('unaccent', (0, sequelize_1.col)("body"))), "LIKE", `%${sanitizedSearchParam}%`),
                            // ticketId: 
                        },
                        required: false,
                        duplicating: false
                    }
                ];
                whereCondition = {
                    ...whereCondition,
                    [sequelize_1.Op.or]: [
                        {
                            "$contact.name$": (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("unaccent", (0, sequelize_1.col)("contact.name"))), "LIKE", `%${sanitizedSearchParam}%`)
                        },
                        { "$contact.number$": { [sequelize_1.Op.like]: `%${sanitizedSearchParam}%` } },
                        {
                            "$message.body$": (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("unaccent", (0, sequelize_1.col)("body"))), "LIKE", `%${sanitizedSearchParam}%`)
                        }
                    ]
                };
            }
            else {
                whereCondition = {
                    ...whereCondition,
                    [sequelize_1.Op.or]: [
                        {
                            "$contact.name$": (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("unaccent", (0, sequelize_1.col)("contact.name"))), "LIKE", `%${sanitizedSearchParam}%`)
                        },
                        { "$contact.number$": { [sequelize_1.Op.like]: `%${sanitizedSearchParam}%` } },
                        // {
                        //   "$message.body$": where(
                        //     fn("LOWER", fn("unaccent", col("body"))),
                        //     "LIKE",
                        //     `%${sanitizedSearchParam}%`
                        //   )
                        // }
                    ]
                };
            }
        }
        if (Array.isArray(tags) && tags.length > 0) {
            const contactTagFilter = [];
            // for (let tag of tags) {
            const contactTags = await ContactTag_1.default.findAll({
                where: { tagId: tags }
            });
            if (contactTags) {
                contactTagFilter.push(contactTags.map(t => t.contactId));
            }
            // }
            const contactsIntersection = (0, lodash_1.intersection)(...contactTagFilter);
            whereCondition = {
                ...whereCondition,
                contactId: contactsIntersection
            };
        }
        if (Array.isArray(users) && users.length > 0) {
            whereCondition = {
                ...whereCondition,
                userId: users
            };
        }
        if (Array.isArray(whatsappIds) && whatsappIds.length > 0) {
            whereCondition = {
                ...whereCondition,
                whatsappId: whatsappIds
            };
        }
        if (Array.isArray(statusFilters) && statusFilters.length > 0) {
            whereCondition = {
                ...whereCondition,
                status: { [sequelize_1.Op.in]: statusFilters }
            };
        }
    }
    else if (withUnreadMessages === "true") {
        // console.log(showNotificationPendingValue)
        whereCondition = {
            [sequelize_1.Op.or]: [
                {
                    userId,
                    status: showNotificationPendingValue ? { [sequelize_1.Op.notIn]: ["closed", "lgpd", "nps"] } : { [sequelize_1.Op.notIn]: ["pending", "closed", "lgpd", "nps", "group"] },
                    queueId: { [sequelize_1.Op.in]: userQueueIds },
                    unreadMessages: { [sequelize_1.Op.gt]: 0 },
                    companyId,
                    isGroup: showGroups ? { [sequelize_1.Op.or]: [true, false] } : false
                },
                {
                    status: showNotificationPendingValue ? { [sequelize_1.Op.in]: ["pending", "group"] } : { [sequelize_1.Op.in]: ["group"] },
                    queueId: showTicketWithoutQueue ? { [sequelize_1.Op.or]: [userQueueIds, null] } : { [sequelize_1.Op.or]: [userQueueIds] },
                    unreadMessages: { [sequelize_1.Op.gt]: 0 },
                    companyId,
                    isGroup: showGroups ? { [sequelize_1.Op.or]: [true, false] } : false
                }
            ]
        };
        if (status === "group" && (user.allowGroup || showAll === "true")) {
            whereCondition = {
                ...whereCondition,
                queueId: { [sequelize_1.Op.or]: [userQueueIds, null] },
            };
        }
    }
    whereCondition = {
        ...whereCondition,
        companyId
    };
    const limit = 40;
    const offset = limit * (+pageNumber - 1);
    const { count, rows: tickets } = await Ticket_1.default.findAndCountAll({
        where: whereCondition,
        include: includeCondition,
        attributes: ["id", "uuid", "userId", "queueId", "isGroup", "channel", "status", "contactId", "useIntegration", "lastMessage", "updatedAt", "unreadMessages"],
        distinct: true,
        limit,
        offset,
        order: [["updatedAt", sortTickets]],
        subQuery: false
    });
    const hasMore = count > offset + tickets.length;
    return {
        tickets,
        count,
        hasMore
    };
};
exports.default = ListTicketsService;
