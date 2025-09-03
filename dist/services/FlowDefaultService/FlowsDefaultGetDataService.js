"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowDefault_1 = require("../../models/FlowDefault");
const FlowsDefaultGetDataService = async ({ companyId, }) => {
    try {
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await FlowDefault_1.FlowDefaultModel.findAndCountAll({
            where: {
                companyId: companyId,
            }
        });
        const flowResult = [];
        rows.forEach((flow) => {
            flowResult.push(flow.toJSON());
        });
        return {
            flow: flowResult[0]
        };
    }
    catch (error) {
        console.error('Erro ao consultar Fluxo:', error);
    }
};
exports.default = FlowsDefaultGetDataService;
