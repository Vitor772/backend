"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowBuilder_1 = require("../../models/FlowBuilder");
const DuplicateFlowBuilderService = async ({ id }) => {
    try {
        const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
            where: {
                id: id
            }
        });
        const duplicate = await FlowBuilder_1.FlowBuilderModel.create({
            name: flow.name + " - copy",
            flow: flow.flow,
            user_id: flow.user_id,
            company_id: flow.company_id
        });
        return duplicate;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = DuplicateFlowBuilderService;
