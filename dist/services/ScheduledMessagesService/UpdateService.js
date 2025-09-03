"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ShowService_1 = __importDefault(require("./ShowService"));
const UpdateUserService = async ({ scheduleData, id, mediaPath, mediaName, }) => {
    const schedule = await (0, ShowService_1.default)(id);
    const { data_mensagem_programada, id_conexao, intervalo, valor_intervalo, mensagem, tipo_dias_envio, mostrar_usuario_mensagem, criar_ticket, contatos, tags, nome, tipo_arquivo, usuario_envio, enviar_quantas_vezes, } = scheduleData;
    let data = {
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
        usuario_envio: mostrar_usuario_mensagem == 'true' ? usuario_envio : null,
        enviar_quantas_vezes
    };
    if (!!mediaName && !!mediaPath) {
        data.mediaName = mediaName;
        data.mediaPath = mediaPath;
    }
    console.log(data);
    await schedule.update(data);
    await schedule.reload();
    return schedule;
};
exports.default = UpdateUserService;
