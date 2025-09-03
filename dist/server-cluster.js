"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_graceful_shutdown_1 = __importDefault(require("http-graceful-shutdown"));
const socket_1 = require("./libs/socket");
const logger_1 = __importDefault(require("./utils/logger"));
const StartAllWhatsAppsSessions_1 = require("./services/WbotServices/StartAllWhatsAppsSessions");
const Company_1 = __importDefault(require("./models/Company"));
const queues_1 = require("./queues");
const express = require("express");
const os = require("os");
const cluster = require("cluster");
const PORT = process.env.PORT || 4000;
const clusterWorkerSize = os.cpus().length;
console.log('clusterWorkerSize', clusterWorkerSize);
if (clusterWorkerSize > 1) {
    if (cluster.isMaster) {
        for (let i = 0; i < clusterWorkerSize; i++) {
            cluster.fork();
        }
        cluster.on("exit", function (worker) {
            console.log("Worker", worker.id, " has exitted.");
        });
    }
    else {
        const app = express();
        const server = app.listen(process.env.PORT, async () => {
            const companies = await Company_1.default.findAll();
            const allPromises = [];
            companies.map(async (c) => {
                const promise = (0, StartAllWhatsAppsSessions_1.StartAllWhatsAppsSessions)(c.id);
                allPromises.push(promise);
            });
            Promise.all(allPromises).then(async () => {
                await (0, queues_1.startQueueProcess)();
            });
            logger_1.default.info(`Server started on port: ${process.env.PORT} and worker ${process.pid}`);
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
}
else {
    const app = express();
    app.listen(PORT, function () {
        console.log(`Express server listening on port ${PORT} with the single worker ${process.pid}`);
    });
}
// const server = app.listen(process.env.PORT, async () => {
//   const companies = await Company.findAll();
//   const allPromises: any[] = [];
//   companies.map(async c => {
//     const promise = StartAllWhatsAppsSessions(c.id);
//     allPromises.push(promise);
//   });
//   Promise.all(allPromises).then(async () => {
//     await startQueueProcess();
//   });
//   logger.info(`Server started on port: ${process.env.PORT}`);
// });
// process.on("uncaughtException", err => {
//   console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
//   console.error(err.stack);
//   process.exit(1);
// });
// process.on("unhandledRejection", (reason, p) => {
//   console.error(
//     `${new Date().toUTCString()} unhandledRejection:`,
//     reason,
//     p
//   );
//   process.exit(1);
// });
// initIO(server);
// gracefulShutdown(server);
