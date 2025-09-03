"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Queue_1 = __importDefault(require("../../models/Queue"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const Prompt_1 = __importDefault(require("../../models/Prompt"));
const ListWhatsAppsService = async ({ session, companyId }) => {
    const options = {
        where: {
            companyId
        },
        include: [
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color", "greetingMessage"]
            },
            {
                model: Prompt_1.default,
                as: "prompt",
            }
        ]
    };
    if (session !== undefined && session == 0) {
        options.attributes = { exclude: ["session"] };
    }
    const whatsapps = await Whatsapp_1.default.findAll(options);
    return whatsapps;
};
exports.default = ListWhatsAppsService;
