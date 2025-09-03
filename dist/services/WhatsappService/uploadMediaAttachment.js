"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedia = exports.mediaUpload = void 0;
const lodash_1 = require("lodash");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mediaUpload = async (req, res) => {
    const { whatsappId } = req.params;
    const files = req.files;
    const file = (0, lodash_1.head)(files);
    try {
        const whatsapp = await Whatsapp_1.default.findByPk(whatsappId);
        whatsapp.greetingMediaAttachment = file.filename;
        await whatsapp.save();
        return res.status(200).json({ mensagem: "Arquivo adicionado!" });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
};
exports.mediaUpload = mediaUpload;
const deleteMedia = async (req, res) => {
    const { whatsappId } = req.params;
    try {
        const whatsapp = await Whatsapp_1.default.findByPk(whatsappId);
        const filePath = path_1.default.resolve("public", whatsapp.greetingMediaAttachment);
        const fileExists = fs_1.default.existsSync(filePath);
        if (fileExists) {
            fs_1.default.unlinkSync(filePath);
        }
        whatsapp.greetingMediaAttachment = null;
        await whatsapp.save();
        return res.send({ message: "Arquivo excluído" });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
};
exports.deleteMedia = deleteMedia;
