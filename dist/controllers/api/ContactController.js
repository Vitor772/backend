"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = exports.show = void 0;
const FindAllContactsServices_1 = __importDefault(require("../../services/ContactServices/FindAllContactsServices"));
const show = async (req, res) => {
    const { companyId } = req.body;
    const contacts = await (0, FindAllContactsServices_1.default)({ companyId });
    return res.json({ count: contacts.length, contacts });
};
exports.show = show;
const count = async (req, res) => {
    const { companyId } = req.body;
    const contacts = await (0, FindAllContactsServices_1.default)({ companyId });
    return res.json({ count: contacts.length });
};
exports.count = count;
