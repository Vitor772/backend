"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Integrations_1 = __importDefault(require("../../models/Integrations"));
const UpdateIntegrationsService = async ({ integration, companyId, value }) => {
    if (!integration || !companyId) {
        throw new AppError_1.default("ERR_INVALID_PARAMETERS", 400);
    }
    const integrations = await Integrations_1.default.findOne({
        where: { name: integration, companyId: companyId }
    });
    if (!integrations) {
        throw new AppError_1.default("ERR_NO_INTEGRATIONS_FOUND", 404);
    }
    await integrations.update({ token: value });
    return integrations;
};
exports.default = UpdateIntegrationsService;
