"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ScheduledMessages_1 = __importDefault(require("../../models/ScheduledMessages"));
const CreateService = async ({ data_mensagem_programada, id_conexao, intervalo, valor_intervalo, mensagem, tipo_dias_envio, mostrar_usuario_mensagem, criar_ticket, contatos, tags, companyId, nome, mediaPath, mediaName, tipo_arquivo, usuario_envio, enviar_quantas_vezes }) => {
    const schema = Yup.object().shape({
        data_mensagem_programada: Yup.date().required(),
        nome: Yup.string().required(),
        intervalo: Yup.string().required(),
        valor_intervalo: Yup.string().required(),
        mensagem: Yup.string().required(),
        tipo_dias_envio: Yup.string().required(),
        mostrar_usuario_mensagem: Yup.boolean().required(),
        criar_ticket: Yup.boolean().required(),
        companyId: Yup.number().required(),
        enviar_quantas_vezes: Yup.string().required(),
        mediaPath: Yup.string(),
        mediaName: Yup.string(),
        tipo_arquivo: Yup.string(),
        usuario_envio: Yup.string(),
    });
    try {
        await schema.validate({
            data_mensagem_programada,
            id_conexao,
            intervalo,
            valor_intervalo,
            mensagem,
            tipo_dias_envio,
            mostrar_usuario_mensagem,
            criar_ticket,
            contatos,
            tags,
            companyId,
            nome,
            mediaPath,
            mediaName,
            tipo_arquivo,
            usuario_envio,
            enviar_quantas_vezes
        });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const schedule = await ScheduledMessages_1.default.create({
        data_mensagem_programada,
        id_conexao,
        intervalo,
        valor_intervalo,
        mensagem,
        tipo_dias_envio,
        mostrar_usuario_mensagem,
        criar_ticket,
        contatos,
        tags,
        companyId,
        nome,
        mediaPath,
        mediaName,
        tipo_arquivo,
        usuario_envio,
        enviar_quantas_vezes
    });
    await schedule.reload();
    return schedule;
};
exports.default = CreateService;
