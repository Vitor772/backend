"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowCampaign_1 = require("../../models/FlowCampaign");
const CreateFlowCampaignService = async ({ userId, name, companyId, phrase, whatsappId, flowId }) => {
    try {
        const flow = await FlowCampaign_1.FlowCampaignModel.create({
            userId: userId,
            companyId: companyId,
            name: name,
            phrase: phrase,
            flowId: flowId,
            whatsappId: whatsappId
        });
        return flow;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = CreateFlowCampaignService;
