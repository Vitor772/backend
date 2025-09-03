"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Contact_1 = __importDefault(require("../../models/Contact"));
const Schedule_1 = __importDefault(require("../../models/Schedule"));
const User_1 = __importDefault(require("../../models/User"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ListService = async ({ searchParam, contactId = "", userId = "", pageNumber = "1", companyId }) => {
    let whereCondition = {};
    const limit = 20;
    const offset = limit * (+pageNumber - 1);
    if (searchParam) {
        whereCondition = {
            [sequelize_1.Op.or]: [
                {
                    "$Schedule.body$": (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.col)("Schedule.body")), "LIKE", `%${searchParam.toLowerCase()}%`)
                },
                {
                    "$Contact.name$": (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("unaccent", (0, sequelize_1.col)("contact.name"))), "LIKE", `%${searchParam.toLowerCase()}%`)
                },
            ],
        };
    }
    if (contactId !== "") {
        whereCondition = {
            ...whereCondition,
            contactId
        };
    }
    if (userId !== "") {
        whereCondition = {
            ...whereCondition,
            userId
        };
    }
    whereCondition = {
        ...whereCondition,
        companyId: {
            [sequelize_1.Op.eq]: companyId
        }
    };
    const { count, rows: schedules } = await Schedule_1.default.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
            { model: Contact_1.default, as: "contact", attributes: ["id", "name", "companyId", "urlPicture"] },
            { model: User_1.default, as: "user", attributes: ["id", "name"] },
            { model: Whatsapp_1.default, as: "whatsapp", attributes: ["id", "name", "channel"] }
        ]
    });
    const hasMore = count > offset + schedules.length;
    return {
        schedules,
        count,
        hasMore
    };
};
exports.default = ListService;
