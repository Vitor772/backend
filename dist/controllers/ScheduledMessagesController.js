"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const lodash_1 = require("lodash");
const AppError_1 = __importDefault(require("../errors/AppError"));
const CreateService_1 = __importDefault(require("../services/ScheduledMessagesService/CreateService"));
const ListService_1 = __importDefault(require("../services/ScheduledMessagesService/ListService"));
const UpdateService_1 = __importDefault(require("../services/ScheduledMessagesService/UpdateService"));
const ShowService_1 = __importDefault(require("../services/ScheduledMessagesService/ShowService"));
const DeleteService_1 = __importDefault(require("../services/ScheduledMessagesService/DeleteService"));
const index = async (req, res) => {
    const { pageNumber, searchParam } = req.query;
    const { companyId } = req.user;
    const { schedules, count, hasMore } = await (0, ListService_1.default)({ searchParam, pageNumber, companyId });
    return res.json({ schedules, count, hasMore });
};
exports.index = index;
const store = async (req, res) => {
    const { data_mensagem_programada, id_conexao, intervalo, valor_intervalo, mensagem, tipo_dias_envio, mostrar_usuario_mensagem, criar_ticket, contatos, tags, nome, tipo_arquivo, usuario_envio, enviar_quantas_vezes } = req.body;
    const { companyId } = req.user;
    const files = req.files;
    const file = (0, lodash_1.head)(files);
    const schedule = await (0, CreateService_1.default)({
        data_mensagem_programada,
        id_conexao,
        intervalo,
        valor_intervalo,
        mensagem,
        tipo_dias_envio,
        mostrar_usuario_mensagem,
        criar_ticket,
        contatos: String(contatos).split(','),
        tags: String(tags).split(','),
        nome,
        tipo_arquivo,
        usuario_envio,
        enviar_quantas_vezes,
        companyId,
        mediaPath: file?.filename,
        mediaName: file?.originalname
    });
    return res.status(200).json(schedule);
};
exports.store = store;
const show = async (req, res) => {
    const { scheduleId } = req.params;
    const { companyId } = req.user;
    const schedule = await (0, ShowService_1.default)(scheduleId);
    return res.status(200).json(schedule);
};
exports.show = show;
const update = async (req, res) => {
    if (req.user.profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { scheduleId } = req.params;
    const scheduleData = req.body;
    const files = req.files;
    const file = (0, lodash_1.head)(files);
    const schedule = await (0, UpdateService_1.default)({ scheduleData, id: scheduleId, mediaPath: !!file ? file?.filename : null, mediaName: !!file ? file?.originalname : null });
    return res.status(200).json(schedule);
};
exports.update = update;
const remove = async (req, res) => {
    const { scheduleId } = req.params;
    const { companyId } = req.user;
    await (0, DeleteService_1.default)(+scheduleId, +companyId);
    return res.status(200).json({ message: "Schedule deleted" });
};
exports.remove = remove;
