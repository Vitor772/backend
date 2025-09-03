"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const QuickMessage_1 = __importDefault(require("../../models/QuickMessage"));
const Company_1 = __importDefault(require("../../models/Company"));
const FindService = async ({ companyId, userId }) => {
    const notes = await QuickMessage_1.default.findAll({
        where: {
            companyId,
            [sequelize_1.Op.or]: [
                {
                    visao: true // Se "visao" é verdadeiro, todas as mensagens são visíveis
                },
                {
                    userId // Se "visao" é falso, apenas as mensagens do usuário atual são visíveis
                }
            ]
        },
        include: [{ model: Company_1.default, as: "company", attributes: ["id", "name"] }],
        order: [["shortcode", "ASC"]]
    });
    return notes;
};
exports.default = FindService;
