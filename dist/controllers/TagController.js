"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeContactTag = exports.syncTags = exports.kanban = exports.list = exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const socket_1 = require("../libs/socket");
const AppError_1 = __importDefault(require("../errors/AppError"));
const CreateService_1 = __importDefault(require("../services/TagServices/CreateService"));
const ListService_1 = __importDefault(require("../services/TagServices/ListService"));
const UpdateService_1 = __importDefault(require("../services/TagServices/UpdateService"));
const ShowService_1 = __importDefault(require("../services/TagServices/ShowService"));
const DeleteService_1 = __importDefault(require("../services/TagServices/DeleteService"));
const SimpleListService_1 = __importDefault(require("../services/TagServices/SimpleListService"));
const SyncTagsService_1 = __importDefault(require("../services/TagServices/SyncTagsService"));
const KanbanListService_1 = __importDefault(require("../services/TagServices/KanbanListService"));
const ContactTag_1 = __importDefault(require("../models/ContactTag"));
const index = async (req, res) => {
    const { pageNumber, searchParam, kanban, tagId } = req.query;
    const { companyId } = req.user;
    const { tags, count, hasMore } = await (0, ListService_1.default)({
        searchParam,
        pageNumber,
        companyId,
        kanban,
        tagId
    });
    return res.json({ tags, count, hasMore });
};
exports.index = index;
const store = async (req, res) => {
    const { name, color, kanban, timeLane, nextLaneId, greetingMessageLane, rollbackLaneId } = req.body;
    const { companyId } = req.user;
    const tag = await (0, CreateService_1.default)({
        name,
        color,
        kanban,
        companyId,
        timeLane,
        nextLaneId,
        greetingMessageLane,
        rollbackLaneId
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company${companyId}-tag`, {
        action: "create",
        tag
    });
    return res.status(200).json(tag);
};
exports.store = store;
const show = async (req, res) => {
    const { tagId } = req.params;
    const tag = await (0, ShowService_1.default)(tagId);
    return res.status(200).json(tag);
};
exports.show = show;
const update = async (req, res) => {
    const { kanban } = req.body;
    //console.log(kanban)
    if (req.user.profile !== "admin" && kanban === 1) {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { tagId } = req.params;
    const tagData = req.body;
    const { companyId } = req.user;
    const tag = await (0, UpdateService_1.default)({ tagData, id: tagId });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company${companyId}-tag`, {
        action: "update",
        tag
    });
    return res.status(200).json(tag);
};
exports.update = update;
const remove = async (req, res) => {
    const { tagId } = req.params;
    const { companyId } = req.user;
    await (0, DeleteService_1.default)(tagId);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company${companyId}-tag`, {
        action: "delete",
        tagId
    });
    return res.status(200).json({ message: "Tag deleted" });
};
exports.remove = remove;
const list = async (req, res) => {
    const { searchParam, kanban } = req.query;
    const { companyId } = req.user;
    const tags = await (0, SimpleListService_1.default)({ searchParam, kanban, companyId });
    return res.json(tags);
};
exports.list = list;
const kanban = async (req, res) => {
    const { companyId } = req.user;
    const tags = await (0, KanbanListService_1.default)({ companyId });
    return res.json({ lista: tags });
};
exports.kanban = kanban;
const syncTags = async (req, res) => {
    const data = req.body;
    const { companyId } = req.user;
    const tags = await (0, SyncTagsService_1.default)({ ...data, companyId });
    return res.json(tags);
};
exports.syncTags = syncTags;
const removeContactTag = async (req, res) => {
    const { tagId, contactId } = req.params;
    const { companyId } = req.user;
    console.log(tagId, contactId);
    await ContactTag_1.default.destroy({
        where: {
            tagId,
            contactId
        }
    });
    const tag = await (0, ShowService_1.default)(tagId);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company${companyId}-tag`, {
        action: "update",
        tag
    });
    return res.status(200).json({ message: "Tag deleted" });
};
exports.removeContactTag = removeContactTag;
