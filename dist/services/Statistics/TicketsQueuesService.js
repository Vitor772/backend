"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const date_fns_1 = require("date-fns");
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const UserQueue_1 = __importDefault(require("../../models/UserQueue"));
const User_1 = __importDefault(require("../../models/User"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const TicketsQueuesService = async ({ dateStart, dateEnd, status, userId, queuesIds, companyId, showAll }) => {
    let whereCondition = {
    // [Op.or]: [{ userId }, { status: "pending" }]
    };
    const includeCondition = [
        {
            model: User_1.default,
            as: "user",
            attributes: ["id", "name", "profile", "online", "profileImage"],
        },
        {
            model: Contact_1.default,
            as: "contact",
            attributes: ["id", "name", "number", "profilePicUrl", "companyId", "urlPicture"]
        },
        {
            model: Queue_1.default,
            as: "queue",
            attributes: ["id", "name", "color"]
        },
        {
            association: "whatsapp",
            attributes: ["id", "name"]
        }
    ];
    const isExistsQueues = await Queue_1.default.count({ where: { companyId } });
    // eslint-disable-next-line eqeqeq
    if (isExistsQueues) {
        const queues = await UserQueue_1.default.findAll({
            where: {
                userId
            }
        });
        let queuesIdsUser = queues.map(q => q.queueId);
        if (queuesIds) {
            const newArray = [];
            queuesIds.forEach(i => {
                const idx = queuesIdsUser.indexOf(+i);
                if (idx) {
                    newArray.push(+i);
                }
            });
            queuesIdsUser = newArray;
        }
        whereCondition = {
            ...whereCondition,
            queueId: {
                [sequelize_1.Op.in]: queuesIdsUser
            }
        };
    }
    // eslint-disable-next-line eqeqeq
    if (showAll == "true") {
        whereCondition = {};
    }
    whereCondition = {
        ...whereCondition,
        status: { [sequelize_1.Op.in]: ["open", "pending"] },
        companyId
    };
    if (dateStart && dateEnd) {
        whereCondition = {
            ...whereCondition,
            createdAt: {
                [sequelize_1.Op.between]: [
                    +(0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(dateStart)),
                    +(0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(dateEnd))
                ]
            }
        };
    }
    const { count, rows: tickets } = await Ticket_1.default.findAndCountAll({
        where: whereCondition,
        include: includeCondition,
        distinct: true,
        subQuery: false,
        order: [
            ["user", "name", "ASC"],
            ["updatedAt", "DESC"],
        ]
    });
    return tickets;
};
exports.default = TicketsQueuesService;
