"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowBuilder_1 = require("../../models/FlowBuilder");
const FlowUpdateDataService = async ({ companyId, bodyData }) => {
    try {
        const flow = await FlowBuilder_1.FlowBuilderModel.update({
            flow: {
                nodes: bodyData.nodes,
                connections: bodyData.connections
            }
        }, {
            where: { id: bodyData.idFlow, company_id: companyId }
        });
        return 'ok';
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = FlowUpdateDataService;
