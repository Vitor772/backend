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
const ScheduledMessagesEnvio_1 = __importDefault(require("../../models/ScheduledMessagesEnvio"));
const CreateService = async ({ mediaPath, mediaName, mensagem, companyId, data_envio, scheduledmessages, key }) => {
    const schema = Yup.object().shape({
        data_mensagem_programada: Yup.date().required(),
        nome: Yup.string().required(),
        mediaPath: Yup.string(),
        mediaName: Yup.string(),
        mensagem: Yup.string().required(),
        companyId: Yup.number().required(),
        data_envio: Yup.date().required(),
        scheduledmessages: Yup.number().required(),
        key: Yup.string().required(),
    });
    try {
        await schema.validate({
            mediaPath,
            mediaName,
            mensagem,
            companyId,
            data_envio,
            scheduledmessages,
            key
        });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    console.log(mediaPath, mediaName);
    const schedule = await ScheduledMessagesEnvio_1.default.create({
        mediaPath,
        mediaName,
        mensagem,
        companyId,
        data_envio,
        scheduledmessages,
        key
    });
    await schedule.reload();
    return schedule;
};
exports.default = CreateService;
