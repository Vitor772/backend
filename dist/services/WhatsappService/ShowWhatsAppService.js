"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const Prompt_1 = __importDefault(require("../../models/Prompt"));
const FlowBuilder_1 = require("../../models/FlowBuilder");
const ShowWhatsAppService = async (id, companyId, session) => {
    const findOptions = {
        include: [
            {
                model: FlowBuilder_1.FlowBuilderModel,
            },
            {
                model: Queue_1.default,
                as: "queues",
                attributes: ["id", "name", "color", "greetingMessage", "integrationId", "fileListId", "closeTicket"],
                include: [
                    {
                        model: Chatbot_1.default,
                        as: "chatbots",
                        attributes: ["id", "name", "greetingMessage", "closeTicket"]
                    }
                ]
            },
            {
                model: Prompt_1.default,
                as: "prompt",
            }
        ],
        order: [
            ["queues", "orderQueue", "ASC"],
            ["queues", "chatbots", "id", "ASC"]
        ]
    };
    if (session !== undefined && session == 0) {
        findOptions.attributes = { exclude: ["session"] };
    }
    const whatsapp = await Whatsapp_1.default.findByPk(id, findOptions);
    if (whatsapp?.companyId !== companyId) {
        throw new AppError_1.default("Não é possível acessar registros de outra empresa");
    }
    if (!whatsapp) {
        throw new AppError_1.default("ERR_NO_WAPP_FOUND", 404);
    }
    return whatsapp;
};
exports.default = ShowWhatsAppService;
