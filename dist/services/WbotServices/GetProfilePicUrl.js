"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GetDefaultWhatsApp_1 = __importDefault(require("../../helpers/GetDefaultWhatsApp"));
const wbot_1 = require("../../libs/wbot");
const GetProfilePicUrl = async (number, companyId, contact) => {
    const defaultWhatsapp = await (0, GetDefaultWhatsApp_1.default)(null, companyId);
    const wbot = (0, wbot_1.getWbot)(defaultWhatsapp.id);
    let profilePicUrl;
    try {
        profilePicUrl = await wbot.profilePictureUrl(contact && contact.isGroup ? contact.remoteJid : `${number}@s.whatsapp.net`, "image");
    }
    catch (error) {
        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
    }
    return profilePicUrl;
};
exports.default = GetProfilePicUrl;
