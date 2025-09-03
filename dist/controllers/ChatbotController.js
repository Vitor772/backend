"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const socket_1 = require("../libs/socket");
const CreateChatBotServices_1 = __importDefault(require("../services/ChatBotServices/CreateChatBotServices"));
const DeleteChatBotServices_1 = __importDefault(require("../services/ChatBotServices/DeleteChatBotServices"));
const ListChatBotServices_1 = __importDefault(require("../services/ChatBotServices/ListChatBotServices"));
const ShowChatBotServices_1 = __importDefault(require("../services/ChatBotServices/ShowChatBotServices"));
const UpdateChatBotServices_1 = __importDefault(require("../services/ChatBotServices/UpdateChatBotServices"));
const index = async (req, res) => {
    const queues = await (0, ListChatBotServices_1.default)();
    return res.status(200).json(queues);
};
exports.index = index;
const store = async (req, res) => {
    const { name, color, greetingMessage, queueType, optIntegrationId, optQueueId, optUserId, optFileId, closeTicket } = req.body;
    const { companyId } = req.user;
    const chatbot = await (0, CreateChatBotServices_1.default)({ name, color, greetingMessage, queueType, optIntegrationId, optQueueId, optUserId, optFileId, closeTicket });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-chatbot`, {
        action: "update",
        chatbot
    });
    return res.status(200).json(chatbot);
};
exports.store = store;
const show = async (req, res) => {
    const { chatbotId } = req.params;
    const queue = await (0, ShowChatBotServices_1.default)(chatbotId);
    return res.status(200).json(queue);
};
exports.show = show;
const update = async (req, res) => {
    const { chatbotId } = req.params;
    const { companyId } = req.user;
    const chatbot = await (0, UpdateChatBotServices_1.default)(chatbotId, req.body);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-chatbot`, {
        action: "update",
        chatbot
    });
    return res.status(201).json(chatbot);
};
exports.update = update;
const remove = async (req, res) => {
    const { chatbotId } = req.params;
    const { companyId } = req.user;
    await (0, DeleteChatBotServices_1.default)(chatbotId);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-chatbot`, {
        action: "delete",
        chatbotId: +chatbotId
    });
    return res.status(200).send();
};
exports.remove = remove;
