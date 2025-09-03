"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Contact_1 = __importDefault(require("../../models/Contact"));
const ContactTag_1 = __importDefault(require("../../models/ContactTag"));
const lodash_1 = require("lodash");
const Tag_1 = __importDefault(require("../../models/Tag"));
const remove_accents_1 = __importDefault(require("remove-accents"));
const ListContactsService = async ({ searchParam = "", pageNumber = "1", companyId, tagsIds, isGroup, userId }) => {
    let whereCondition;
    if (searchParam) {
        // console.log("searchParam", searchParam)
        const sanitizedSearchParam = (0, remove_accents_1.default)(searchParam.toLocaleLowerCase().trim());
        whereCondition = {
            ...whereCondition,
            [sequelize_1.Op.or]: [
                {
                    name: (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("unaccent", (0, sequelize_1.col)("Contact.name"))), "LIKE", `%${sanitizedSearchParam}%`)
                },
                { number: { [sequelize_1.Op.like]: `%${sanitizedSearchParam}%` } }
            ]
        };
    }
    whereCondition = {
        ...whereCondition,
        companyId
    };
    // const user = await ShowUserService(userId, companyId);
    // console.log(user)
    // if (user.whatsappId) {
    //   whereCondition = {
    //     ...whereCondition,
    //     whatsappId: user.whatsappId
    //   };
    // }
    if (Array.isArray(tagsIds) && tagsIds.length > 0) {
        const contactTagFilter = [];
        // for (let tag of tags) {
        const contactTags = await ContactTag_1.default.findAll({
            where: { tagId: { [sequelize_1.Op.in]: tagsIds } }
        });
        if (contactTags) {
            contactTagFilter.push(contactTags.map(t => t.contactId));
        }
        // }
        const contactTagsIntersection = (0, lodash_1.intersection)(...contactTagFilter);
        whereCondition = {
            ...whereCondition,
            id: {
                [sequelize_1.Op.in]: contactTagsIntersection
            }
        };
    }
    if (isGroup === "false") {
        console.log("isGroup", isGroup);
        whereCondition = {
            ...whereCondition,
            isGroup: false
        };
    }
    const limit = 100;
    const offset = limit * (+pageNumber - 1);
    const { count, rows: contacts } = await Contact_1.default.findAndCountAll({
        where: whereCondition,
        attributes: ["id", "name", "number", "email", "isGroup", "urlPicture", "active", "companyId", "channel"],
        limit,
        include: [
            // {
            //   model: Ticket,
            //   as: "tickets",
            //   attributes: ["id", "status", "createdAt", "updatedAt"],
            //   limit: 1,
            //   order: [["updatedAt", "DESC"]]
            // },   
            {
                model: Tag_1.default,
                as: "tags",
                attributes: ["id", "name"]
                //include: ["tags"]
            },
            // {
            //   model: Whatsapp,
            //   as: "whatsapp",
            //   attributes: ["id", "name", "expiresTicket", "groupAsTicket"]
            // },
        ],
        offset,
        // subQuery: false,
        order: [["name", "ASC"]]
    });
    const hasMore = count > offset + contacts.length;
    return {
        contacts,
        count,
        hasMore
    };
};
exports.default = ListContactsService;
