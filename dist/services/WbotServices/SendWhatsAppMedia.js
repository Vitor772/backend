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
exports.getMessageOptions = void 0;
const Sentry = __importStar(require("@sentry/node"));
const fs_1 = __importStar(require("fs"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const mime_types_1 = __importDefault(require("mime-types"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const wbot_1 = require("../../libs/wbot");
const CreateMessageService_1 = __importDefault(require("../MessageServices/CreateMessageService"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const os = require("os");
// let ffmpegPath;
// if (os.platform() === "win32") {
//   // Windows
//   ffmpegPath = "C:\\ffmpeg\\ffmpeg.exe"; // Substitua pelo caminho correto no Windows
// } else if (os.platform() === "darwin") {
//   // macOS
//   ffmpegPath = "/opt/homebrew/bin/ffmpeg"; // Substitua pelo caminho correto no macOS
// } else {
//   // Outros sistemas operacionais (Linux, etc.)
//   ffmpegPath = "/usr/bin/ffmpeg"; // Substitua pelo caminho correto em sistemas Unix-like
// }
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
const processAudio = async (audio, companyId) => {
    const outputAudio = `${publicFolder}/company${companyId}/${new Date().getTime()}.mp3`;
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`${ffmpeg_1.default.path} -i ${audio}  -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio} -y`, (error, _stdout, _stderr) => {
            if (error)
                reject(error);
            // fs.unlinkSync(audio);
            resolve(outputAudio);
        });
    });
    // return new Promise((resolve, reject) => {
    //   exec(
    //     `${ffmpegPath} -i ${audio} -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`,
    //     (error, _stdout, _stderr) => {
    //       if (error) reject(error);
    //       // fs.unlinkSync(audio);
    //       resolve(outputAudio);
    //     }
    //   );
    // });
};
const processAudioFile = async (audio, companyId) => {
    const outputAudio = `${publicFolder}/company${companyId}/${new Date().getTime()}.mp3`;
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`${ffmpeg_1.default.path} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`, (error, _stdout, _stderr) => {
            if (error)
                reject(error);
            // fs.unlinkSync(audio);
            resolve(outputAudio);
        });
    });
};
const getMessageOptions = async (fileName, pathMedia, companyId, body = " ") => {
    const mimeType = mime_types_1.default.lookup(pathMedia);
    const typeMessage = mimeType.split("/")[0];
    try {
        if (!mimeType) {
            throw new Error("Invalid mimetype");
        }
        let options;
        if (typeMessage === "video") {
            options = {
                video: fs_1.default.readFileSync(pathMedia),
                caption: body ? body : null,
                fileName: fileName
                // gifPlayback: true
            };
        }
        else if (typeMessage === "audio") {
            const typeAudio = true; //fileName.includes("audio-record-site");
            const convert = await processAudio(pathMedia, companyId);
            if (typeAudio) {
                options = {
                    audio: fs_1.default.readFileSync(convert),
                    mimetype: "audio/mp4",
                    ptt: true
                };
            }
            else {
                options = {
                    audio: fs_1.default.readFileSync(convert),
                    mimetype: typeAudio ? "audio/mp4" : mimeType,
                    ptt: true
                };
            }
        }
        else if (typeMessage === "document") {
            options = {
                document: fs_1.default.readFileSync(pathMedia),
                caption: body ? body : null,
                fileName: fileName,
                mimetype: mimeType
            };
        }
        else if (typeMessage === "application") {
            options = {
                document: fs_1.default.readFileSync(pathMedia),
                caption: body ? body : null,
                fileName: fileName,
                mimetype: mimeType
            };
        }
        else {
            options = {
                image: fs_1.default.readFileSync(pathMedia),
                caption: body ? body : null,
            };
        }
        return options;
    }
    catch (e) {
        Sentry.captureException(e);
        console.log(e);
        return null;
    }
};
exports.getMessageOptions = getMessageOptions;
const SendWhatsAppMedia = async ({ media, ticket, body = "", isPrivate = false, isForwarded = false }) => {
    try {
        const wbot = await (0, wbot_1.getWbot)(ticket.whatsappId);
        const companyId = ticket.companyId.toString();
        const pathMedia = media.path;
        const typeMessage = media.mimetype.split("/")[0];
        let options;
        let bodyTicket = "";
        const bodyMedia = ticket ? (0, Mustache_1.default)(body, ticket) : body;
        // console.log(media.mimetype)
        if (typeMessage === "video") {
            options = {
                video: fs_1.default.readFileSync(pathMedia),
                caption: bodyMedia,
                fileName: media.originalname.replace('/', '-'),
                contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
            };
            bodyTicket = "🎥 Arquivo de vídeo";
        }
        else if (typeMessage === "audio") {
            const typeAudio = true; //media.originalname.includes("audio-record-site");
            if (typeAudio) {
                const convert = await processAudio(media.path, companyId);
                options = {
                    audio: fs_1.default.readFileSync(convert),
                    mimetype: "audio/mpeg",
                    ptt: true,
                    caption: bodyMedia,
                    contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
                };
                (0, fs_1.unlinkSync)(convert);
            }
            else {
                const convert = await processAudio(media.path, companyId);
                options = {
                    audio: fs_1.default.readFileSync(convert),
                    mimetype: "audio/mpeg",
                    ptt: true,
                    contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
                };
                (0, fs_1.unlinkSync)(convert);
            }
            bodyTicket = "🎵 Arquivo de áudio";
        }
        else if (typeMessage === "document" || typeMessage === "text") {
            options = {
                document: fs_1.default.readFileSync(pathMedia),
                caption: bodyMedia,
                fileName: media.originalname.replace('/', '-'),
                mimetype: media.mimetype,
                contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
            };
            bodyTicket = "📂 Documento";
        }
        else if (typeMessage === "application") {
            options = {
                document: fs_1.default.readFileSync(pathMedia),
                caption: bodyMedia,
                fileName: media.originalname.replace('/', '-'),
                mimetype: media.mimetype,
                contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
            };
            bodyTicket = "📎 Outros anexos";
        }
        else {
            if (media.mimetype.includes("gif")) {
                options = {
                    image: fs_1.default.readFileSync(pathMedia),
                    caption: bodyMedia,
                    mimetype: "image/gif",
                    contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
                    gifPlayback: true
                };
            }
            else {
                options = {
                    image: fs_1.default.readFileSync(pathMedia),
                    caption: bodyMedia,
                    contextInfo: { forwardingScore: isForwarded ? 2 : 0, isForwarded: isForwarded },
                };
            }
            bodyTicket = "📎 Outros anexos";
        }
        if (isPrivate === true) {
            const messageData = {
                wid: `PVT${companyId}${ticket.id}${body.substring(0, 6)}`,
                ticketId: ticket.id,
                contactId: undefined,
                body: bodyMedia,
                fromMe: true,
                mediaUrl: media.filename,
                mediaType: media.mimetype.split("/")[0],
                read: true,
                quotedMsgId: null,
                ack: 2,
                remoteJid: null,
                participant: null,
                dataJson: null,
                ticketTrakingId: null,
                isPrivate
            };
            await (0, CreateMessageService_1.default)({ messageData, companyId: ticket.companyId });
            return;
        }
        const contactNumber = await Contact_1.default.findByPk(ticket.contactId);
        let number;
        if (contactNumber.remoteJid && contactNumber.remoteJid !== "" && contactNumber.remoteJid.includes("@")) {
            number = contactNumber.remoteJid;
        }
        else {
            number = `${contactNumber.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
        }
        const sentMessage = await wbot.sendMessage(number, {
            ...options
        });
        await ticket.update({ lastMessage: body !== media.filename ? body : bodyMedia, imported: null });
        return sentMessage;
    }
    catch (err) {
        console.log(`ERRO AO ENVIAR MIDIA ${ticket.id} media ${media.originalname}`);
        Sentry.captureException(err);
        console.log(err);
        throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
    }
};
exports.default = SendWhatsAppMedia;
