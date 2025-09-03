"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const Integrations_1 = __importDefault(require("../models/Integrations"));
const CheckIntegrations = async (key, companyId) => {
    const integrations = await Integrations_1.default.findOne({
        where: { name: key, companyId: companyId }
    });
    if (!integrations) {
        throw new AppError_1.default("ERR_NO_INTEGRATIONS_FOUND", 404);
    }
    return integrations.dataValues;
};
exports.default = CheckIntegrations;
