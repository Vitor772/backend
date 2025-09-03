"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ListFilterWhatsAppsService = async ({ session, companyId, channel = "whatsapp" }) => {
    const options = {
        where: {
            companyId,
            channel
        }
    };
    if (session !== undefined && session == 0) {
        options.attributes = { exclude: ["session"] };
    }
    const whatsapps = await Whatsapp_1.default.findAll(options);
    return whatsapps;
};
exports.default = ListFilterWhatsAppsService;
