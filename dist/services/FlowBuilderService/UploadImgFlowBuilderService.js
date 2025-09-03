"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowImg_1 = require("../../models/FlowImg");
const UploadImgFlowBuilderService = async ({ userId, name, companyId }) => {
    try {
        const flowImg = await FlowImg_1.FlowImgModel.create({
            userId: userId,
            companyId: companyId,
            name: name,
        });
        return flowImg;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = UploadImgFlowBuilderService;
