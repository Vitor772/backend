"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDialogflowSessionWithModel = exports.createDialogflowSession = void 0;
const dialogflow_1 = require("@google-cloud/dialogflow");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const logger_1 = __importDefault(require("../../utils/logger"));
const sessions = new Map();
const createDialogflowSession = async (id, projectName, jsonContent) => {
    if (sessions.has(id)) {
        return sessions.get(id);
    }
    const keyFilename = path_1.default.join(os_1.default.tmpdir(), `whaticket_${id}.json`);
    logger_1.default.info(`Openig new dialogflow session #${projectName} in '${keyFilename}'`);
    await fs_1.default.writeFileSync(keyFilename, jsonContent);
    const session = new dialogflow_1.SessionsClient({ keyFilename });
    sessions.set(id, session);
    return session;
};
exports.createDialogflowSession = createDialogflowSession;
const createDialogflowSessionWithModel = async (model) => {
    console.log("ID:" + model.id + " name:" + model.projectName + " json:" + model.jsonContent);
    return createDialogflowSession(model.id, model.projectName, model.jsonContent);
};
exports.createDialogflowSessionWithModel = createDialogflowSessionWithModel;
