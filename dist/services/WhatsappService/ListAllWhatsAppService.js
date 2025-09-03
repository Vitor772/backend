"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = __importDefault(require("../../models/Queue"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ListAllWhatsAppsService = async ({ session, }) => {
    const options = {
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color", "greetingMessage"]
            }
        ]
    };
    if (session !== undefined && session == 0) {
        options.attributes = { exclude: ["session"] };
    }
    const whatsapps = await Whatsapp_1.default.findAll(options);
    return whatsapps;
};
exports.default = ListAllWhatsAppsService;
