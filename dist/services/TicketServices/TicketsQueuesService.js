"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const date_fns_1 = require("date-fns");
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const User_1 = __importDefault(require("../../models/User"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const lodash_1 = require("lodash");
const TicketsQueuesService = async ({ dateStart, dateEnd, status, userId, queuesIds, companyId, showAll, profile }) => {
    let whereCondition = {
    // [Op.or]: [{ userId }, { status: "pending" }]
    };
    const includeCondition = [
        {
            model: Contact_1.default,
            as: "contact",
            attributes: ["id", "name", "number", "profilePicUrl", "companyId", "urlPicture"]
        },
        {
            model: User_1.default,
            as: "user",
            attributes: ["id", "name", "profile"]
        },
        {
            model: Queue_1.default,
            as: "queue"
        }
    ];
    // const isExistsQueues = await Queue.count({ where: { companyId } });
    // // eslint-disable-next-line eqeqeq
    // if (isExistsQueues) {
    //   const queues = await UserQueue.findAll({
    //     where: {
    //       userId
    //     }
    //   });
    //   let queuesIdsUser = queues.map(q => q.queueId);
    //   if (queuesIds) {
    //     const newArray: number[] = [];
    //     queuesIds.forEach(i => {
    //       const idx = queuesIdsUser.indexOf(+i);
    //       if (idx) {
    //         newArray.push(+i);
    //       }
    //     });
    //     queuesIdsUser = newArray;
    //   }
    //   whereCondition = {
    //     ...whereCondition,
    //     queueId: {
    //       [Op.in]: queuesIdsUser
    //     }
    //   };
    // }
    // eslint-disable-next-line eqeqeq
    if (status) {
        const maxTicketsFilter = [];
        const maxTicketIds = await Ticket_1.default.findAll({
            where: {
                status: "open"
            },
            group: ['companyId', 'contactId', 'queueId', 'whatsappId'],
            attributes: ['companyId', 'contactId', 'queueId', 'whatsappId', [(0, sequelize_1.fn)('max', (0, sequelize_1.col)('id')), 'id']],
        });
        if (maxTicketIds) {
            maxTicketsFilter.push(maxTicketIds.map(t => t.id));
        }
        // }
        const contactsIntersection = (0, lodash_1.intersection)(...maxTicketsFilter);
        whereCondition = {
            ...whereCondition,
            id: {
                [sequelize_1.Op.in]: contactsIntersection
            }
        };
    }
    if (profile === "user") {
        whereCondition = {
            ...whereCondition,
            userId
        };
    }
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
    const tickets = await Ticket_1.default.findAll({
        where: {
            ...whereCondition,
            // queueId: {
            //   [Op.in]: queuesIdsUser
            // },
            companyId
        },
        include: includeCondition,
        order: [["updatedAt", "DESC"]]
    });
    return tickets;
};
exports.default = TicketsQueuesService;
