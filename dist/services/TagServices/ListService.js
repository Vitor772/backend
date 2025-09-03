"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Tag_1 = __importDefault(require("../../models/Tag"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const remove_accents_1 = __importDefault(require("remove-accents"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const ListService = async ({ companyId, searchParam = "", pageNumber = "1", kanban = 0, tagId = 0 }) => {
    let whereCondition = {};
    const limit = 20;
    const offset = limit * (+pageNumber - 1);
    const sanitizedSearchParam = (0, remove_accents_1.default)(searchParam.toLocaleLowerCase().trim());
    if (Number(kanban) === 0) {
        if (searchParam) {
            whereCondition = {
                [sequelize_1.Op.or]: [
                    {
                        name: sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("Tag.name")), "LIKE", `%${sanitizedSearchParam}%`)
                    },
                    { color: { [sequelize_1.Op.like]: `%${sanitizedSearchParam}%` } }
                    // { kanban: { [Op.like]: `%${searchParam}%` } }
                ]
            };
        }
        const { count, rows: tags } = await Tag_1.default.findAndCountAll({
            where: { ...whereCondition, companyId, kanban },
            limit,
            include: [
                {
                    // model: ContactTag,
                    // as: "contactTags",
                    // include: [
                    //   {
                    model: Contact_1.default,
                    as: "contacts",
                    //   }
                    // ]
                },
            ],
            attributes: [
                'id',
                'name',
                'color',
            ],
            offset,
            order: [["name", "ASC"]],
        });
        const hasMore = count > offset + tags.length;
        return {
            tags,
            count,
            hasMore
        };
    }
    else {
        if (searchParam) {
            whereCondition = {
                [sequelize_1.Op.or]: [
                    {
                        name: sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("Tag.name")), "LIKE", `%${sanitizedSearchParam}%`)
                    },
                    { color: { [sequelize_1.Op.like]: `%${sanitizedSearchParam}%` } }
                    // { kanban: { [Op.like]: `%${searchParam}%` } }
                ]
            };
        }
        if (tagId > 0) {
            whereCondition = {
                ...whereCondition,
                id: { [sequelize_1.Op.ne]: [tagId] }
            };
        }
        // console.log(whereCondition)
        const { count, rows: tags } = await Tag_1.default.findAndCountAll({
            where: { ...whereCondition, companyId, kanban },
            limit,
            offset,
            order: [["name", "ASC"]],
            include: [
                {
                    model: TicketTag_1.default,
                    as: "ticketTags",
                },
            ],
            attributes: [
                'id',
                'name',
                'color',
            ],
        });
        const hasMore = count > offset + tags.length;
        return {
            tags,
            count,
            hasMore
        };
    }
};
exports.default = ListService;
