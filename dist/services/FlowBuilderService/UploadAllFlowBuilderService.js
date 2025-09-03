"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FlowAudio_1 = require("../../models/FlowAudio");
const FlowImg_1 = require("../../models/FlowImg");
const UploadAllFlowBuilderService = async ({ userId, medias, companyId }) => {
    try {
        let itemsNewNames = [];
        for (let i = 0; medias.length > i; i++) {
            let nameFile = medias[i].filename;
            //if (medias[i].filename.split(".").length === 1) {
            //  nameFile = medias[i].filename + "." + medias[i].mimetype.split("/")[1];
            //}
            itemsNewNames = [...itemsNewNames, nameFile];
            if (medias[i].mimetype.split("/")[1] === "png" ||
                medias[i].mimetype.split("/")[1] === "jpg" ||
                medias[i].mimetype.split("/")[1] === "jpeg") {
                await FlowImg_1.FlowImgModel.create({
                    userId: userId,
                    companyId: companyId,
                    name: nameFile
                });
            }
            if (medias[i].mimetype.split("/")[1] === "mp3" ||
                medias[i].mimetype.split("/")[1] === "ogg" ||
                medias[i].mimetype.split("/")[1] === "mp4" ||
                medias[i].mimetype.split("/")[1] === "mpeg") {
                if (medias[i].mimetype.split("/")[1] === "mpeg") {
                    nameFile = nameFile.split('.')[0] + '.mp3';
                }
                await FlowAudio_1.FlowAudioModel.create({
                    userId: userId,
                    companyId: companyId,
                    name: nameFile
                });
            }
        }
        return itemsNewNames;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = UploadAllFlowBuilderService;
