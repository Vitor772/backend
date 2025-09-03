"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowBuilder_1 = require("../../models/FlowBuilder");
const CreateFlowBuilderService = async ({ userId, name, companyId }) => {
    try {
        const nameExist = await FlowBuilder_1.FlowBuilderModel.findOne({
            where: {
                name,
                company_id: companyId
            }
        });
        if (nameExist) {
            return 'exist';
        }
        const flow = await FlowBuilder_1.FlowBuilderModel.create({
            user_id: userId,
            company_id: companyId,
            name: name,
        });
        return flow;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = CreateFlowBuilderService;
