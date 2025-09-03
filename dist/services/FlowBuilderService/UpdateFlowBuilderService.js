"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowBuilder_1 = require("../../models/FlowBuilder");
const UpdateFlowBuilderService = async ({ companyId, name, flowId }) => {
    try {
        const nameExist = await FlowBuilder_1.FlowBuilderModel.findOne({
            where: {
                name,
                company_id: companyId
            }
        });
        console.log({ nameExist });
        if (nameExist) {
            return 'exist';
        }
        const flow = await FlowBuilder_1.FlowBuilderModel.update({ name }, {
            where: { id: flowId, company_id: companyId }
        });
        return 'ok';
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = UpdateFlowBuilderService;
