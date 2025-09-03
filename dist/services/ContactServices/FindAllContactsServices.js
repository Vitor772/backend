"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Contact_1 = __importDefault(require("../../models/Contact"));
const ContactCustomField_1 = __importDefault(require("../../models/ContactCustomField"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const FindAllContactService = async ({ companyId }) => {
    let where = {
        companyId
    };
    const contacts = await Contact_1.default.findAll({
        where,
        order: [["name", "ASC"]],
        include: [
            { model: Tag_1.default, as: "tags", attributes: ["id", "name", "color", "updatedAt"] },
            { model: ContactCustomField_1.default, as: "extraInfo", attributes: ["id", "name", "value"] }
        ]
    });
    return contacts;
};
exports.default = FindAllContactService;
