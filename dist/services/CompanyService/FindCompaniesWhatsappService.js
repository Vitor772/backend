"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Company_1 = __importDefault(require("../../models/Company"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const FindCompaniesWhatsappService = async (id) => {
    const companies = await Company_1.default.findOne({
        where: { id },
        order: [["name", "ASC"]],
        include: [
            { model: Whatsapp_1.default, attributes: ["id", "name", "status"], where: { isDefault: true } },
        ]
    });
    return companies;
};
exports.default = FindCompaniesWhatsappService;
