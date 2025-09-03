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
exports.isBullAuth = void 0;
require("./bootstrap");
require("reflect-metadata");
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const Sentry = __importStar(require("@sentry/node"));
const dotenv_1 = require("dotenv");
const body_parser_1 = __importDefault(require("body-parser"));
require("./database");
const upload_1 = __importDefault(require("./config/upload"));
const AppError_1 = __importDefault(require("./errors/AppError"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./utils/logger"));
const queues_1 = require("./queues");
const queue_1 = __importDefault(require("./libs/queue"));
const bull_board_1 = __importDefault(require("bull-board"));
const basic_auth_1 = __importDefault(require("basic-auth"));
// Função de middleware para autenticação básica
const isBullAuth = (req, res, next) => {
    const user = (0, basic_auth_1.default)(req);
    if (!user || user.name !== process.env.BULL_USER || user.pass !== process.env.BULL_PASS) {
        res.set('WWW-Authenticate', 'Basic realm="example"');
        return res.status(401).send('Authentication required.');
    }
    next();
};
exports.isBullAuth = isBullAuth;
// Carregar variáveis de ambiente
(0, dotenv_1.config)();
// Inicializar Sentry
Sentry.init({ dsn: process.env.SENTRY_DSN });
const app = (0, express_1.default)();
// Configuração de filas
app.set("queues", {
    messageQueue: queues_1.messageQueue,
    sendScheduledMessages: queues_1.sendScheduledMessages
});
const allowedOrigins = [process.env.FRONTEND_URL];
// Configuração do BullBoard
if (String(process.env.BULL_BOARD).toLocaleLowerCase() === 'true' && process.env.REDIS_URI_ACK !== '') {
    bull_board_1.default.setQueues(queue_1.default.queues.map(queue => queue && queue.bull));
    app.use('/admin/queues', exports.isBullAuth, bull_board_1.default.UI);
}
// Middlewares
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'", "https://localhost:8080"],
//       imgSrc: ["'self'", "data:", "https://localhost:8080"],
//       scriptSrc: ["'self'", "https://localhost:8080"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://localhost:8080"],
//       connectSrc: ["'self'", "https://localhost:8080"]
//     }
//   },
//   crossOriginResourcePolicy: false, // Permite recursos de diferentes origens
//   crossOriginEmbedderPolicy: false, // Permite incorporação de diferentes origens
//   crossOriginOpenerPolicy: false, // Permite abertura de diferentes origens
//   // crossOriginResourcePolicy: {
//   //   policy: "cross-origin" // Permite carregamento de recursos de diferentes origens
//   // }
// }));
app.use((0, compression_1.default)()); // Compressão HTTP
app.use(body_parser_1.default.json({ limit: '5mb' })); // Aumentar o limite de carga para 5 MB
app.use(body_parser_1.default.urlencoded({ limit: '5mb', extended: true }));
app.use((0, cors_1.default)({
    credentials: true,
    origin: allowedOrigins
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express_1.default.static(upload_1.default.directory));
// Rotas
app.use(routes_1.default);
// Manipulador de erros do Sentry
app.use(Sentry.Handlers.errorHandler());
// Middleware de tratamento de erros
app.use(async (err, req, res, _) => {
    if (err instanceof AppError_1.default) {
        logger_1.default.warn(err);
        return res.status(err.statusCode).json({ error: err.message });
    }
    logger_1.default.error(err);
    return res.status(500).json({ error: "Internal server error" });
});
exports.default = app;
