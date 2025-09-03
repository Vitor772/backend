"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Contact_1 = __importDefault(require("../../models/Contact"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sequelize_1 = require("sequelize");
const NumberSimpleListService = async ({ number, companyId }) => {
    let options = {
        order: [
            ['name', 'ASC']
        ]
    };
    if (number) {
        options.where = {
            number: {
                [sequelize_1.Op.like]: `%${number}%`
            }
        };
    }
    options.where = {
        ...options.where,
        companyId
    };
    const contacts = await Contact_1.default.findAll(options);
    if (!contacts) {
        throw new AppError_1.default("ERR_NO_CONTACT_FOUND", 404);
    }
    return contacts;
};
exports.default = NumberSimpleListService;
