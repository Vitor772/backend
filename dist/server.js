"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_graceful_shutdown_1 = __importDefault(require("http-graceful-shutdown"));
const https_1 = __importDefault(require("https")); // Importando https para o servidor
const fs_1 = __importDefault(require("fs")); // Para ler os arquivos do certificado
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./libs/socket");
const logger_1 = __importDefault(require("./utils/logger"));
const StartAllWhatsAppsSessions_1 = require("./services/WbotServices/StartAllWhatsAppsSessions");
const Company_1 = __importDefault(require("./models/Company"));
const queue_1 = __importDefault(require("./libs/queue"));
const queues_1 = require("./queues");
if (process.env.CERTIFICADOS == "true") {
    const httpsOptions = {
        key: fs_1.default.readFileSync(process.env.SSL_KEY_FILE),
        cert: fs_1.default.readFileSync(process.env.SSL_CRT_FILE)
    };
    const server = https_1.default.createServer(httpsOptions, app_1.default).listen(process.env.PORT, async () => {
        const companies = await Company_1.default.findAll({
            where: { status: true },
            attributes: ["id"]
        });
        const allPromises = [];
        companies.map(async (c) => {
            const promise = (0, StartAllWhatsAppsSessions_1.StartAllWhatsAppsSessions)(c.id);
            allPromises.push(promise);
        });
        Promise.all(allPromises).then(async () => {
            await (0, queues_1.startQueueProcess)();
        });
        if (process.env.REDIS_URI_ACK && process.env.REDIS_URI_ACK !== '') {
            queue_1.default.process();
        }
        logger_1.default.info(`Server started on port: ${process.env.PORT} with HTTPS`);
    });
    process.on("uncaughtException", err => {
        console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
        console.error(err.stack);
        process.exit(1);
    });
    process.on("unhandledRejection", (reason, p) => {
        console.error(`${new Date().toUTCString()} unhandledRejection:`, reason, p);
        process.exit(1);
    });
    (0, socket_1.initIO)(server);
    (0, http_graceful_shutdown_1.default)(server);
}
else {
    const server = app_1.default.listen(process.env.PORT, async () => {
        const companies = await Company_1.default.findAll({
            where: { status: true },
            attributes: ["id"]
        });
        const allPromises = [];
        companies.map(async (c) => {
            const promise = (0, StartAllWhatsAppsSessions_1.StartAllWhatsAppsSessions)(c.id);
            allPromises.push(promise);
        });
        Promise.all(allPromises).then(async () => {
            await (0, queues_1.startQueueProcess)();
        });
        if (process.env.REDIS_URI_ACK && process.env.REDIS_URI_ACK !== '') {
            queue_1.default.process();
        }
        logger_1.default.info(`Server started on port: ${process.env.PORT}`);
    });
    process.on("uncaughtException", err => {
        console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
        console.error(err.stack);
        process.exit(1);
    });
    process.on("unhandledRejection", (reason, p) => {
        console.error(`${new Date().toUTCString()} unhandledRejection:`, reason, p);
        process.exit(1);
    });
    (0, socket_1.initIO)(server);
    (0, http_graceful_shutdown_1.default)(server);
}
