"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowAudio_1 = require("../../models/FlowAudio");
const UploadAudioFlowBuilderService = async ({ userId, name, companyId }) => {
    try {
        const flowImg = await FlowAudio_1.FlowAudioModel.create({
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
exports.default = UploadAudioFlowBuilderService;
