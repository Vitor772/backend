"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const ScheduledMessages_1 = __importDefault(require("../../models/ScheduledMessages"));
const ListService = async ({ searchParam, pageNumber = "1", companyId }) => {
    let whereCondition = {};
    const limit = 20;
    const offset = limit * (+pageNumber - 1);
    if (!!searchParam) {
        whereCondition = {
            [sequelize_1.Op.or]: [
                {
                    "$Schedule.body$": sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("Schedule.message")), "LIKE", `%${searchParam.toLowerCase()}%`)
                },
                {
                    "$Contact.name$": sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("contact.name")), "LIKE", `%${searchParam.toLowerCase()}%`)
                },
            ],
        };
    }
    whereCondition = {
        ...whereCondition,
        companyId: {
            [sequelize_1.Op.eq]: companyId
        }
    };
    const { count, rows: schedules } = await ScheduledMessages_1.default.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [["createdAt", "DESC"]]
    });
    const hasMore = count > offset + schedules.length;
    return {
        schedules,
        count,
        hasMore
    };
};
exports.default = ListService;
