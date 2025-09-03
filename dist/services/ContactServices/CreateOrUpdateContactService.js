"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("../../libs/socket");
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importStar(require("path"));
const logger_1 = __importDefault(require("../../utils/logger"));
const lodash_1 = require("lodash");
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const Sentry = __importStar(require("@sentry/node"));
const axios = require('axios');
const downloadProfileImage = async ({ profilePicUrl, companyId, contact }) => {
    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
    let filename;
    const folder = path_1.default.resolve(publicFolder, `company${companyId}`, "contacts");
    if (!fs_1.default.existsSync(folder)) {
        fs_1.default.mkdirSync(folder, { recursive: true });
        fs_1.default.chmodSync(folder, 0o777);
    }
    try {
        const response = await axios.get(profilePicUrl, {
            responseType: 'arraybuffer'
        });
        filename = `${new Date().getTime()}.jpeg`;
        fs_1.default.writeFileSync((0, path_1.join)(folder, filename), response.data);
    }
    catch (error) {
        console.error(error);
    }
    return filename;
};
const CreateOrUpdateContactService = async ({ name, number: rawNumber, profilePicUrl, isGroup, email = "", channel = "whatsapp", companyId, extraInfo = [], remoteJid = "", whatsappId, wbot }) => {
    try {
        let createContact = false;
        const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
        const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");
        const io = (0, socket_1.getIO)();
        let contact;
        contact = await Contact_1.default.findOne({
            where: { number, companyId }
        });
        let updateImage = (!contact || contact?.profilePicUrl !== profilePicUrl && profilePicUrl !== "") && wbot || false;
        console.log(93, "CreateUpdateContactService", { updateImage });
        if (contact) {
            contact.remoteJid = remoteJid;
            contact.profilePicUrl = profilePicUrl || null;
            contact.isGroup = isGroup;
            if ((0, lodash_1.isNil)(contact.whatsappId)) {
                const whatsapp = await Whatsapp_1.default.findOne({
                    where: { id: whatsappId, companyId }
                });
                console.log(104, "CreateUpdateContactService");
                if (whatsapp) {
                    contact.whatsappId = whatsappId;
                }
            }
            const folder = path_1.default.resolve(publicFolder, `company${companyId}`, "contacts");
            let fileName, oldPath = "";
            if (contact.urlPicture) {
                console.log(114, "CreateUpdateContactService");
                oldPath = path_1.default.resolve(contact.urlPicture.replace(/\\/g, '/'));
                fileName = path_1.default.join(folder, oldPath.split('\\').pop());
            }
            if (!fs_1.default.existsSync(fileName) || contact.profilePicUrl === "") {
                if (wbot && ['whatsapp'].includes(channel)) {
                    try {
                        console.log(120, "CreateUpdateContactService");
                        profilePicUrl = await wbot.profilePictureUrl(remoteJid, "image");
                    }
                    catch (e) {
                        Sentry.captureException(e);
                        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
                    }
                    contact.profilePicUrl = profilePicUrl;
                    updateImage = true;
                }
            }
            if (contact.name === number) {
                contact.name = name;
            }
            await contact.save(); // Ensure save() is called to trigger updatedAt
            await contact.reload();
        }
        else if (wbot && ['whatsapp'].includes(channel)) {
            const settings = await CompaniesSettings_1.default.findOne({ where: { companyId } });
            const { acceptAudioMessageContact } = settings;
            let newRemoteJid = remoteJid;
            if (!remoteJid && remoteJid !== "") {
                newRemoteJid = isGroup ? `${rawNumber}@g.us` : `${rawNumber}@s.whatsapp.net`;
            }
            try {
                profilePicUrl = await wbot.profilePictureUrl(remoteJid, "image");
            }
            catch (e) {
                Sentry.captureException(e);
                profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
            }
            contact = await Contact_1.default.create({
                name,
                number,
                email,
                isGroup,
                companyId,
                channel,
                acceptAudioMessage: acceptAudioMessageContact === 'enabled' ? true : false,
                remoteJid: newRemoteJid,
                profilePicUrl,
                urlPicture: "",
                whatsappId
            });
            createContact = true;
        }
        else if (['facebook', 'instagram'].includes(channel)) {
            contact = await Contact_1.default.create({
                name,
                number,
                email,
                isGroup,
                companyId,
                channel,
                profilePicUrl,
                urlPicture: "",
                whatsappId
            });
        }
        if (updateImage) {
            let filename;
            filename = await downloadProfileImage({
                profilePicUrl,
                companyId,
                contact
            });
            await contact.update({
                urlPicture: filename,
                pictureUpdated: true
            });
            await contact.reload();
        }
        else {
            if (['facebook', 'instagram'].includes(channel)) {
                let filename;
                filename = await downloadProfileImage({
                    profilePicUrl,
                    companyId,
                    contact
                });
                await contact.update({
                    urlPicture: filename,
                    pictureUpdated: true
                });
                await contact.reload();
            }
        }
        if (createContact) {
            io.of(String(companyId))
                .emit(`company-${companyId}-contact`, {
                action: "create",
                contact
            });
        }
        else {
            io.of(String(companyId))
                .emit(`company-${companyId}-contact`, {
                action: "update",
                contact
            });
        }
        return contact;
    }
    catch (err) {
        logger_1.default.error("Error to find or create a contact:", err);
        throw err;
    }
};
exports.default = CreateOrUpdateContactService;
