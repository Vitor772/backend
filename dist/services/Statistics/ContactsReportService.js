"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const sequelize_1 = require("sequelize");
const Contact_1 = __importDefault(require("../../models/Contact"));
const Tag_1 = __importDefault(require("../../models/Tag"));
// import ContactWallet from "../../models/ContactWallet";
const dddsPorEstado = [
    { estado: "AC", ddds: ["68"] },
    { estado: "AL", ddds: ["82"] },
    { estado: "AM", ddds: ["92", "97"] },
    { estado: "AP", ddds: ["96"] },
    { estado: "BA", ddds: ["71", "73", "74", "75", "77"] },
    { estado: "CE", ddds: ["85", "88"] },
    { estado: "DF", ddds: ["61"] },
    { estado: "ES", ddds: ["27", "28"] },
    { estado: "GO", ddds: ["62", "64"] },
    { estado: "MA", ddds: ["98", "99"] },
    { estado: "MG", ddds: ["31", "32", "33", "34", "35", "37", "38"] },
    { estado: "MS", ddds: ["67"] },
    { estado: "MT", ddds: ["65", "66"] },
    { estado: "PA", ddds: ["91", "93", "94"] },
    { estado: "PB", ddds: ["83"] },
    { estado: "PE", ddds: ["81", "87"] },
    { estado: "PI", ddds: ["86", "89"] },
    { estado: "PR", ddds: ["41", "42", "43", "44", "45", "46"] },
    { estado: "RJ", ddds: ["21", "22", "24"] },
    { estado: "RN", ddds: ["84"] },
    { estado: "RO", ddds: ["69"] },
    { estado: "RR", ddds: ["95"] },
    { estado: "RS", ddds: ["51", "53", "54", "55"] },
    { estado: "SC", ddds: ["47", "48", "49"] },
    { estado: "SE", ddds: ["79"] },
    {
        estado: "SP",
        ddds: ["11", "12", "13", "14", "15", "16", "17", "18", "19"]
    },
    { estado: "TO", ddds: ["63"] }
];
const ListContactsService = async ({ startDate, endDate, companyId, tags, wallets, ddds, userId, profile, searchParam }) => {
    let includeCondition = [];
    let where = {
        companyId,
        isGroup: false
    };
    if (searchParam) {
        where = {
            ...where,
            [sequelize_1.Op.or]: [
                {
                    name: sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("Contact.name")), "LIKE", `%${searchParam.toLowerCase().trim()}%`)
                },
                { number: { [sequelize_1.Op.like]: `%${searchParam.toLowerCase().trim()}%` } }
            ]
        };
    }
    if (startDate && endDate) {
        where = {
            ...where,
            createdAt: {
                [sequelize_1.Op.between]: [
                    +(0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(startDate)),
                    +(0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(endDate))
                ]
            }
        };
    }
    if (tags) {
        includeCondition = [
            {
                model: Tag_1.default,
                as: "tags",
                where: {
                    id: {
                        [sequelize_1.Op.in]: tags
                    }
                },
                required: true
            }
        ];
    }
    // if (wallets) {
    //   includeCondition.push({
    //     model: ContactWallet,
    //     // as: "wallets",
    //     where: {
    //       walletId: wallets
    //     },
    //     required: true
    //   });
    // } else if (profile !== "admin") {
    //   includeCondition.push({
    //     model: ContactWallet,
    //     // as: "wallet",
    //     where: {
    //       walletId: userId
    //     },
    //     required: true
    //   });
    // }
    if (ddds) {
        let dddsFilter = [];
        // eslint-disable-next-line consistent-return
        ddds.forEach((el) => {
            if (el) {
                const d = dddsPorEstado.find((ddd) => ddd.estado === el)?.ddds;
                if (d) {
                    dddsFilter = dddsFilter.concat(d);
                }
            }
        });
        where = {
            ...where,
            number: {
                [sequelize_1.Op.or]: dddsFilter.map(ddd => ({ [sequelize_1.Op.like]: `55${ddd}%` }))
            }
        };
    }
    const contacts = await Contact_1.default.findAll({
        where,
        attributes: ["id", "name", "number", "email"],
        include: includeCondition,
        order: [["name", "ASC"]]
    });
    return { contacts };
};
exports.default = ListContactsService;
