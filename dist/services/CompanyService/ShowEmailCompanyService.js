"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Company_1 = __importDefault(require("../../models/Company"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowEmailCompanyService = async (email) => {
    const company = await Company_1.default.findOne({
        where: { email },
        include: ["plan"]
    });
    if (!company) {
        throw new AppError_1.default("ERR_NO_COMPANY_FOUND", 404);
    }
    return company;
};
exports.default = ShowEmailCompanyService;
