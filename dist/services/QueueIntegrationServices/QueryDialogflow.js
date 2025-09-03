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
exports.queryDialogFlow = void 0;
const Sentry = __importStar(require("@sentry/node"));
const logger_1 = __importDefault(require("../../utils/logger"));
async function detectIntent(sessionClient, projectId, sessionId, query, languageCode) {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode
            }
        }
    };
    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}
async function detectAudioIntent(sessionClient, projectId, sessionId, languageCode, inputAudio) {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    const encoding = 6;
    const sampleRateHertz = 16000;
    const request = {
        session: sessionPath,
        queryInput: {
            audioConfig: {
                audioEncoding: encoding,
                sampleRateHertz: sampleRateHertz,
                languageCode: languageCode
            }
        },
        inputAudio: inputAudio
    };
    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}
async function queryDialogFlow(sessionClient, projectId, sessionId, query, languageCode, inputAudio) {
    let intentResponse;
    if (inputAudio) {
        try {
            intentResponse = await detectAudioIntent(sessionClient, projectId, sessionId, languageCode, inputAudio);
            const responses = intentResponse?.queryResult?.fulfillmentMessages;
            const endConversation = intentResponse?.queryResult?.diagnosticInfo?.fields?.end_conversation
                ?.boolValue;
            const parameters = intentResponse?.queryResult?.parameters?.fields;
            const encodedAudio = intentResponse?.outputAudio;
            if (responses?.length === 0) {
                return null;
            }
            else {
                return {
                    responses,
                    endConversation,
                    parameters,
                    encodedAudio
                };
            }
        }
        catch (error) {
            Sentry.captureException(error);
            logger_1.default.error(`Error handling whatsapp message: Err: ${error}`);
        }
        return null;
    }
    else {
        try {
            intentResponse = await detectIntent(sessionClient, projectId, sessionId, query, languageCode);
            const responses = intentResponse?.queryResult?.fulfillmentMessages;
            const endConversation = intentResponse?.queryResult?.diagnosticInfo?.fields?.end_conversation
                ?.boolValue;
            const parameters = intentResponse?.queryResult?.parameters?.fields;
            const encodedAudio = intentResponse?.outputAudio;
            if (responses?.length === 0) {
                return null;
            }
            else {
                return {
                    responses,
                    endConversation,
                    parameters,
                    encodedAudio
                };
            }
        }
        catch (error) {
            Sentry.captureException(error);
            logger_1.default.error(`Error handling whatsapp message: Err: ${error}`);
        }
        return null;
    }
}
exports.queryDialogFlow = queryDialogFlow;
