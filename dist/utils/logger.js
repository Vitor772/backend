"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
// Função para obter o timestamp com fuso horário
const timezoned = () => {
    return (0, moment_timezone_1.default)().tz('America/Sao_Paulo').format('DD-MM-YYYY HH:mm:ss');
};
const logger = (0, pino_1.default)({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
            ignore: "pid,hostname"
        },
    },
    timestamp: () => `,"time":"${timezoned()}"`, // Adiciona o timestamp formatado
});
exports.default = logger;
