"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowBuilder_1 = require("../../models/FlowBuilder");
const ListFlowBuilderService = async ({ companyId, }) => {
    try {
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await FlowBuilder_1.FlowBuilderModel.findAndCountAll({
            where: {
                company_id: companyId
            }
        });
        const flowResult = [];
        rows.forEach((flow) => {
            flowResult.push(flow.toJSON());
        });
        return {
            flows: flowResult,
        };
    }
    catch (error) {
        console.error('Erro ao consultar usuários:', error);
    }
};
exports.default = ListFlowBuilderService;
