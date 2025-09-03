"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tag_1 = __importDefault(require("../../models/Tag"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const ContactTag_1 = __importDefault(require("../../models/ContactTag"));
const SyncTags = async ({ tags, contactId }) => {
    const contact = await Contact_1.default.findByPk(contactId, { include: [Tag_1.default] });
    const tagList = tags.map(t => ({ tagId: t.id, contactId }));
    await ContactTag_1.default.destroy({ where: { contactId } });
    await ContactTag_1.default.bulkCreate(tagList);
    contact?.reload();
    return contact;
};
exports.default = SyncTags;
