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
exports.typeSimulation = void 0;
const Sentry = __importStar(require("@sentry/node"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const GetTicketWbot_1 = __importDefault(require("../../helpers/GetTicketWbot"));
const mime_types_1 = __importDefault(require("mime-types"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
const processAudio = async (audio) => {
    const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`${ffmpeg_1.default.path} -i ${audio} -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`, (error, _stdout, _stderr) => {
            if (error)
                reject(error);
            //fs.unlinkSync(audio);
            resolve(outputAudio);
        });
    });
};
const processAudioFile = async (audio) => {
    const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`${ffmpeg_1.default.path} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`, (error, _stdout, _stderr) => {
            if (error)
                reject(error);
            //fs.unlinkSync(audio);
            resolve(outputAudio);
        });
    });
};
const nameFileDiscovery = (pathMedia) => {
    const spliting = pathMedia.split('/');
    const first = spliting[spliting.length - 1];
    return first.split(".")[0];
};
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const typeSimulation = async (ticket, presence) => {
    const wbot = await (0, GetTicketWbot_1.default)(ticket);
    let contact = await Contact_1.default.findOne({
        where: {
            id: ticket.contactId,
        }
    });
    await wbot.sendPresenceUpdate(presence, `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
    await delay(5000);
    await wbot.sendPresenceUpdate('paused', `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`);
};
exports.typeSimulation = typeSimulation;
const SendWhatsAppMediaFlow = async ({ media, ticket, body, isFlow = false, isRecord = false }) => {
    try {
        const wbot = await (0, GetTicketWbot_1.default)(ticket);
        const mimetype = mime_types_1.default.lookup(media);
        const pathMedia = media;
        const typeMessage = mimetype.split("/")[0];
        const mediaName = nameFileDiscovery(media);
        let options;
        if (typeMessage === "video") {
            options = {
                video: fs_1.default.readFileSync(pathMedia),
                caption: body,
                fileName: mediaName
                // gifPlayback: true
            };
        }
        else if (typeMessage === "audio") {
            console.log('record', isRecord);
            if (isRecord) {
                const convert = await processAudio(pathMedia);
                options = {
                    audio: fs_1.default.readFileSync(convert),
                    mimetype: typeMessage ? "audio/mp4" : mimetype,
                    ptt: true
                };
            }
            else {
                const convert = await processAudioFile(pathMedia);
                options = {
                    audio: fs_1.default.readFileSync(convert),
                    mimetype: typeMessage ? "audio/mp4" : mimetype,
                    ptt: false
                };
            }
        }
        else if (typeMessage === "document" || typeMessage === "text") {
            options = {
                document: fs_1.default.readFileSync(pathMedia),
                caption: body,
                fileName: mediaName,
                mimetype: mimetype
            };
        }
        else if (typeMessage === "application") {
            options = {
                document: fs_1.default.readFileSync(pathMedia),
                caption: body,
                fileName: mediaName,
                mimetype: mimetype
            };
        }
        else {
            options = {
                image: fs_1.default.readFileSync(pathMedia),
                caption: body
            };
        }
        let contact = await Contact_1.default.findOne({
            where: {
                id: ticket.contactId,
            }
        });
        const sentMessage = await wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
            ...options
        });
        await ticket.update({ lastMessage: mediaName });
        return sentMessage;
    }
    catch (err) {
        Sentry.captureException(err);
        console.log(err);
        throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
    }
};
exports.default = SendWhatsAppMediaFlow;
