"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ContactTag_1 = __importDefault(require("../../models/ContactTag"));
const FindContactTags = async ({ contactId }) => {
    let where = {
        contactId
    };
    const contactsTags = await ContactTag_1.default.findAll({
        where
    });
    return contactsTags;
};
exports.default = FindContactTags;
