"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FlowCampaign_1 = require("../../models/FlowCampaign");
const DeleteFlowCampaignService = async (id) => {
    const flow = await FlowCampaign_1.FlowCampaignModel.findOne({
        where: { id: id }
    });
    if (!flow) {
        throw new AppError_1.default("ERR_NO_TICKET_FOUND", 404);
    }
    await flow.destroy();
    return flow;
};
exports.default = DeleteFlowCampaignService;
