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
exports.listWhatsapp = exports.updateContactWallet = exports.toggleDisableBot = exports.getContactTags = exports.getContactVcard = exports.getContactProfileURL = exports.upload = exports.blockUnblock = exports.toggleAcceptAudio = exports.list = exports.remove = exports.update = exports.show = exports.store = exports.getContact = exports.index = exports.importXls = void 0;
const Yup = __importStar(require("yup"));
const socket_1 = require("../libs/socket");
const lodash_1 = require("lodash");
const ListContactsService_1 = __importDefault(require("../services/ContactServices/ListContactsService"));
const CreateContactService_1 = __importDefault(require("../services/ContactServices/CreateContactService"));
const ShowContactService_1 = __importDefault(require("../services/ContactServices/ShowContactService"));
const UpdateContactService_1 = __importDefault(require("../services/ContactServices/UpdateContactService"));
const DeleteContactService_1 = __importDefault(require("../services/ContactServices/DeleteContactService"));
const GetContactService_1 = __importDefault(require("../services/ContactServices/GetContactService"));
const CheckNumber_1 = __importDefault(require("../services/WbotServices/CheckNumber"));
const GetProfilePicUrl_1 = __importDefault(require("../services/WbotServices/GetProfilePicUrl"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const SimpleListService_1 = __importDefault(require("../services/ContactServices/SimpleListService"));
const ToggleAcceptAudioContactService_1 = __importDefault(require("../services/ContactServices/ToggleAcceptAudioContactService"));
const BlockUnblockContactService_1 = __importDefault(require("../services/ContactServices/BlockUnblockContactService"));
const ImportContactsService_1 = require("../services/ContactServices/ImportContactsService");
const NumberSimpleListService_1 = __importDefault(require("../services/ContactServices/NumberSimpleListService"));
const CreateOrUpdateContactServiceForImport_1 = __importDefault(require("../services/ContactServices/CreateOrUpdateContactServiceForImport"));
const UpdateContactWalletsService_1 = __importDefault(require("../services/ContactServices/UpdateContactWalletsService"));
const FindContactTags_1 = __importDefault(require("../services/ContactServices/FindContactTags"));
const ToggleDisableBotContactService_1 = __importDefault(require("../services/ContactServices/ToggleDisableBotContactService"));
const Contact_1 = __importDefault(require("../models/Contact"));
const Tag_1 = __importDefault(require("../models/Tag"));
const ContactTag_1 = __importDefault(require("../models/ContactTag"));
const logger_1 = __importDefault(require("../utils/logger"));
const importXls = async (req, res) => {
    const { companyId } = req.user;
    const { number, name, email, validateContact, tags } = req.body;
    const simpleNumber = String(number).replace(/[^\d.-]+/g, '');
    let validNumber = simpleNumber;
    if (validateContact === "true") {
        validNumber = await (0, CheckNumber_1.default)(simpleNumber, companyId);
    }
    /**
     * Código desabilitado por demora no retorno
     */
    // 
    // const profilePicUrl = await GetProfilePicUrl(validNumber, companyId);
    // const defaultWhatsapp = await GetDefaultWhatsApp(companyId);
    const contactData = {
        name: `${name}`,
        number: validNumber,
        profilePicUrl: "",
        isGroup: false,
        email,
        companyId,
        // whatsappId: defaultWhatsapp.id
    };
    const contact = await (0, CreateOrUpdateContactServiceForImport_1.default)(contactData);
    if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim());
        for (const tagName of tagList) {
            try {
                let [tag, created] = await Tag_1.default.findOrCreate({
                    where: { name: tagName, companyId, color: "#A4CCCC", kanban: 0 }
                });
                // Associate the tag with the contact
                await ContactTag_1.default.findOrCreate({
                    where: {
                        contactId: contact.id,
                        tagId: tag.id
                    }
                });
            }
            catch (error) {
                logger_1.default.info("Erro ao criar Tags", error);
            }
        }
    }
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
        action: "create",
        contact
    });
    return res.status(200).json(contact);
};
exports.importXls = importXls;
const index = async (req, res) => {
    const { searchParam, pageNumber, contactTag: tagIdsStringified, isGroup } = req.query;
    const { id: userId, companyId } = req.user;
    console.log("index", { companyId, userId, searchParam });
    let tagsIds = [];
    if (tagIdsStringified) {
        tagsIds = JSON.parse(tagIdsStringified);
    }
    const { contacts, count, hasMore } = await (0, ListContactsService_1.default)({
        searchParam,
        pageNumber,
        companyId,
        tagsIds,
        isGroup,
        userId: Number(userId)
    });
    return res.json({ contacts, count, hasMore });
};
exports.index = index;
const getContact = async (req, res) => {
    const { name, number } = req.body;
    const { companyId } = req.user;
    console.log("getContact", { companyId, name, number });
    const contact = await (0, GetContactService_1.default)({
        name,
        number,
        companyId
    });
    return res.status(200).json(contact);
};
exports.getContact = getContact;
const store = async (req, res) => {
    const { companyId } = req.user;
    const newContact = req.body;
    const newRemoteJid = newContact.number;
    console.log("store", { companyId, newContact });
    const findContact = await Contact_1.default.findOne({
        where: {
            number: newContact.number.replace("-", "").replace(" ", ""),
            companyId
        }
    });
    if (findContact) {
        throw new AppError_1.default("Contact already exists");
    }
    newContact.number = newContact.number.replace("-", "").replace(" ", "");
    const schema = Yup.object().shape({
        name: Yup.string().required(),
        number: Yup.string()
            .required()
            .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
    });
    try {
        await schema.validate(newContact);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const validNumber = await (0, CheckNumber_1.default)(newContact.number, companyId);
    /**
     * Código desabilitado por demora no retorno
     */
    // const profilePicUrl = await GetProfilePicUrl(validNumber.jid, companyId);
    const contact = await (0, CreateContactService_1.default)({
        ...newContact,
        number: validNumber,
        // profilePicUrl,
        companyId
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
        action: "create",
        contact
    });
    return res.status(200).json(contact);
};
exports.store = store;
const show = async (req, res) => {
    const { contactId } = req.params;
    const { companyId } = req.user;
    const contact = await (0, ShowContactService_1.default)(contactId, companyId);
    return res.status(200).json(contact);
};
exports.show = show;
const update = async (req, res) => {
    const contactData = req.body;
    const { companyId } = req.user;
    const { contactId } = req.params;
    const schema = Yup.object().shape({
        name: Yup.string(),
        number: Yup.string().matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
    });
    try {
        await schema.validate(contactData);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const oldContact = await (0, ShowContactService_1.default)(contactId, companyId);
    if (oldContact.number != contactData.number && oldContact.channel == "whatsapp") {
        const isGroup = oldContact && oldContact.remoteJid ? oldContact.remoteJid.endsWith("@g.us") : oldContact.isGroup;
        const validNumber = await (0, CheckNumber_1.default)(contactData.number, companyId, isGroup);
        const number = validNumber;
        contactData.number = number;
    }
    const contact = await (0, UpdateContactService_1.default)({
        contactData,
        contactId,
        companyId
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
        action: "update",
        contact
    });
    return res.status(200).json(contact);
};
exports.update = update;
const remove = async (req, res) => {
    const { contactId } = req.params;
    const { companyId } = req.user;
    await (0, ShowContactService_1.default)(contactId, companyId);
    await (0, DeleteContactService_1.default)(contactId);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
        action: "delete",
        contactId
    });
    return res.status(200).json({ message: "Contact deleted" });
};
exports.remove = remove;
const list = async (req, res) => {
    const { name } = req.query;
    const { companyId } = req.user;
    const contacts = await (0, SimpleListService_1.default)({ name, companyId });
    return res.json(contacts);
};
exports.list = list;
const toggleAcceptAudio = async (req, res) => {
    var { contactId } = req.params;
    const { companyId } = req.user;
    const contact = await (0, ToggleAcceptAudioContactService_1.default)({ contactId });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
        action: "update",
        contact
    });
    return res.status(200).json(contact);
};
exports.toggleAcceptAudio = toggleAcceptAudio;
const blockUnblock = async (req, res) => {
    var { contactId } = req.params;
    const { companyId } = req.user;
    const { active } = req.body;
    const contact = await (0, BlockUnblockContactService_1.default)({ contactId, companyId, active });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
        action: "update",
        contact
    });
    return res.status(200).json(contact);
};
exports.blockUnblock = blockUnblock;
const upload = async (req, res) => {
    const files = req.files;
    const file = (0, lodash_1.head)(files);
    const { companyId } = req.user;
    const response = await (0, ImportContactsService_1.ImportContactsService)(companyId, file);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
        action: "reload",
        records: response
    });
    return res.status(200).json(response);
};
exports.upload = upload;
const getContactProfileURL = async (req, res) => {
    const { number } = req.params;
    const { companyId } = req.user;
    console.log("getContactProfileURL", { number, companyId });
    if (number) {
        const validNumber = await (0, CheckNumber_1.default)(number, companyId);
        const profilePicUrl = await (0, GetProfilePicUrl_1.default)(validNumber, companyId);
        const contact = await (0, NumberSimpleListService_1.default)({ number: validNumber, companyId: companyId });
        let obj;
        if (contact.length > 0) {
            obj = {
                contactId: contact[0].id,
                profilePicUrl: profilePicUrl
            };
        }
        else {
            obj = {
                contactId: 0,
                profilePicUrl: profilePicUrl
            };
        }
        return res.status(200).json(obj);
    }
};
exports.getContactProfileURL = getContactProfileURL;
const getContactVcard = async (req, res) => {
    const { name, number } = req.query;
    const { companyId } = req.user;
    let vNumber = number;
    const numberDDI = vNumber.toString().substr(0, 2);
    const numberDDD = vNumber.toString().substr(2, 2);
    const numberUser = vNumber.toString().substr(-8, 8);
    if (numberDDD <= '30' && numberDDI === '55') {
        console.log("menor 30");
        vNumber = `${numberDDI + numberDDD + 9 + numberUser}@s.whatsapp.net`;
    }
    else if (numberDDD > '30' && numberDDI === '55') {
        console.log("maior 30");
        vNumber = `${numberDDI + numberDDD + numberUser}@s.whatsapp.net`;
    }
    else {
        vNumber = `${number}@s.whatsapp.net`;
    }
    const contact = await (0, GetContactService_1.default)({
        name,
        number,
        companyId
    });
    return res.status(200).json(contact);
};
exports.getContactVcard = getContactVcard;
const getContactTags = async (req, res) => {
    const { contactId } = req.params;
    const contactTags = await (0, FindContactTags_1.default)({ contactId });
    let tags = false;
    if (contactTags.length > 0) {
        tags = true;
    }
    return res.status(200).json({ tags: tags });
};
exports.getContactTags = getContactTags;
const toggleDisableBot = async (req, res) => {
    var { contactId } = req.params;
    const { companyId } = req.user;
    const contact = await (0, ToggleDisableBotContactService_1.default)({ contactId });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-contact`, {
        action: "update",
        contact
    });
    return res.status(200).json(contact);
};
exports.toggleDisableBot = toggleDisableBot;
const updateContactWallet = async (req, res) => {
    const { wallets } = req.body;
    const { contactId } = req.params;
    const { companyId } = req.user;
    const contact = await (0, UpdateContactWalletsService_1.default)({
        wallets,
        contactId,
        companyId
    });
    return res.status(200).json(contact);
};
exports.updateContactWallet = updateContactWallet;
const listWhatsapp = async (req, res) => {
    const { name } = req.query;
    const { companyId } = req.user;
    const contactsAll = await (0, SimpleListService_1.default)({ name, companyId });
    const contacts = contactsAll.filter(contact => contact.channel == "whatsapp");
    return res.json(contacts);
};
exports.listWhatsapp = listWhatsapp;
