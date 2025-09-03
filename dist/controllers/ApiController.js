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
exports.indexWhatsappsId = exports.checkNumber = exports.indexImage = exports.index = exports.OnWhatsAppDto = void 0;
const Yup = __importStar(require("yup"));
const fs_1 = __importDefault(require("fs"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const GetDefaultWhatsApp_1 = __importDefault(require("../helpers/GetDefaultWhatsApp"));
const SetTicketMessagesAsRead_1 = __importDefault(require("../helpers/SetTicketMessagesAsRead"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const CreateOrUpdateContactService_1 = __importDefault(require("../services/ContactServices/CreateOrUpdateContactService"));
const FindOrCreateTicketService_1 = __importDefault(require("../services/TicketServices/FindOrCreateTicketService"));
const CheckNumber_1 = __importDefault(require("../services/WbotServices/CheckNumber"));
const SendWhatsAppMedia_1 = __importStar(require("../services/WbotServices/SendWhatsAppMedia"));
const UpdateTicketService_1 = __importDefault(require("../services/TicketServices/UpdateTicketService"));
const wbot_1 = require("../libs/wbot");
const SendWhatsAppMessageAPI_1 = __importDefault(require("../services/WbotServices/SendWhatsAppMessageAPI"));
const SendWhatsappMediaImage_1 = __importDefault(require("../services/WbotServices/SendWhatsappMediaImage"));
const ApiUsages_1 = __importDefault(require("../models/ApiUsages"));
const useDate_1 = require("../utils/useDate");
const moment_1 = __importDefault(require("moment"));
const CompaniesSettings_1 = __importDefault(require("../models/CompaniesSettings"));
const ShowUserService_1 = __importDefault(require("../services/UserServices/ShowUserService"));
const lodash_1 = require("lodash");
const wbotMessageListener_1 = require("../services/WbotServices/wbotMessageListener");
const ShowQueueService_1 = __importDefault(require("../services/QueueService/ShowQueueService"));
const path_1 = __importDefault(require("path"));
const FindOrCreateATicketTrakingService_1 = __importDefault(require("../services/TicketServices/FindOrCreateATicketTrakingService"));
const async_mutex_1 = require("async-mutex");
class OnWhatsAppDto {
    constructor(jid, exists) {
        this.jid = jid;
        this.exists = exists;
    }
}
exports.OnWhatsAppDto = OnWhatsAppDto;
const createContact = async (whatsappId, companyId, newContact, userId, queueId, wbot) => {
    try {
        // await CheckIsValidContact(newContact, companyId);
        const validNumber = await (0, CheckNumber_1.default)(newContact, companyId, newContact.length > 17);
        const contactData = {
            name: `${validNumber}`,
            number: validNumber,
            profilePicUrl: "",
            isGroup: false,
            companyId,
            whatsappId,
            remoteJid: validNumber.length > 17 ? `${validNumber}@g.us` : `${validNumber}@s.whatsapp.net`,
            wbot
        };
        const contact = await (0, CreateOrUpdateContactService_1.default)(contactData);
        const settings = await CompaniesSettings_1.default.findOne({
            where: { companyId }
        }); // return contact;
        let whatsapp;
        if (whatsappId === undefined) {
            whatsapp = await (0, GetDefaultWhatsApp_1.default)(whatsappId, companyId);
        }
        else {
            whatsapp = await Whatsapp_1.default.findByPk(whatsappId);
            if (whatsapp === null) {
                throw new AppError_1.default(`whatsapp #${whatsappId} not found`);
            }
        }
        const mutex = new async_mutex_1.Mutex();
        // Inclui a busca de ticket aqui, se realmente não achar um ticket, então vai para o findorcreate
        const createTicket = await mutex.runExclusive(async () => {
            const ticket = await (0, FindOrCreateTicketService_1.default)(contact, whatsapp, 0, companyId, queueId, userId, null, whatsapp.channel, null, false, settings, false, false);
            return ticket;
        });
        if (createTicket && createTicket.channel === "whatsapp") {
            (0, SetTicketMessagesAsRead_1.default)(createTicket);
            await (0, FindOrCreateATicketTrakingService_1.default)({ ticketId: createTicket.id, companyId, whatsappId: whatsapp.id, userId });
        }
        return createTicket;
    }
    catch (error) {
        throw new AppError_1.default(error.message);
    }
};
function formatBRNumber(jid) {
    const regexp = new RegExp(/^(\d{2})(\d{2})\d{1}(\d{8})$/);
    if (regexp.test(jid)) {
        const match = regexp.exec(jid);
        if (match && match[1] === '55' && Number.isInteger(Number.parseInt(match[2]))) {
            const ddd = Number.parseInt(match[2]);
            if (ddd < 31) {
                return match[0];
            }
            else if (ddd >= 31) {
                return match[1] + match[2] + match[3];
            }
        }
    }
    else {
        return jid;
    }
}
function createJid(number) {
    if (number.includes('@g.us') || number.includes('@s.whatsapp.net')) {
        return formatBRNumber(number);
    }
    return number.includes('-')
        ? `${number}@g.us`
        : `${formatBRNumber(number)}@s.whatsapp.net`;
}
// export const indexLink = async (req: Request, res: Response): Promise<Response> => {
//   const newContact: ContactData = req.body;
//   const { whatsappId }: WhatsappData = req.body;
//   const { msdelay }: any = req.body;
//   const url = req.body.url;
//   const caption = req.body.caption;
//   const authHeader = req.headers.authorization;
//   const [, token] = authHeader.split(" ");
//   const whatsapp = await Whatsapp.findOne({ where: { token } });
//   const companyId = whatsapp.companyId;
//   newContact.number = newContact.number.replace("-", "").replace(" ", "");
//   const schema = Yup.object().shape({
//     number: Yup.string()
//       .required()
//       .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
//   });
//   try {
//     await schema.validate(newContact);
//   } catch (err: any) {
//     throw new AppError(err.message);
//   }
//   const contactAndTicket = await createContact(whatsappId, companyId, newContact.number);
//   if (!contactAndTicket) {
//     throw new AppError("Cliente em outro atendimento")
//   }
//   await SendWhatsAppMessageLink({ whatsappId, contact: contactAndTicket.contact, url, caption, msdelay });
//   setTimeout(async () => {
//     const { dateToClient } = useDate();
//     const hoje: string = dateToClient(new Date())
//     const timestamp = moment().format();
//     const exist = await ApiUsages.findOne({
//       where: {
//         dateUsed: hoje,
//         companyId: companyId
//       }
//     });
//     if (exist) {
//       await exist.update({
//         usedPDF: exist.dataValues["usedPDF"] + 1,
//         UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
//         updatedAt: timestamp
//       });
//     } else {
//       const usage = await ApiUsages.create({
//         companyId: companyId,
//         dateUsed: hoje,
//       });
//       await usage.update({
//         usedPDF: usage.dataValues["usedPDF"] + 1,
//         UsedOnDay: usage.dataValues["UsedOnDay"] + 1,
//         updatedAt: timestamp
//       });
//     }
//   }, 100);
//   return res.send({ status: "SUCCESS" });
// };
const index = async (req, res) => {
    const newContact = req.body;
    const { whatsappId } = req.body;
    const { msdelay } = req.body;
    const { number, body, quotedMsg, userId, queueId, sendSignature = false, closeTicket = false, noRegister = false } = req.body;
    const medias = req.files;
    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");
    const whatsapp = await Whatsapp_1.default.findOne({ where: { token } });
    const companyId = whatsapp.companyId;
    newContact.number = newContact.number.replace(" ", "");
    const schema = Yup.object().shape({
        number: Yup.string()
            .required()
            .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
    });
    try {
        await schema.validate(newContact);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const wbot = await (0, wbot_1.getWbot)(whatsapp.id);
    let user;
    if (userId?.toString() !== "" && !isNaN(userId)) {
        user = await (0, ShowUserService_1.default)(userId, companyId);
    }
    let queue;
    if (queueId?.toString() !== "" && !isNaN(queueId)) {
        queue = await (0, ShowQueueService_1.default)(queueId, companyId);
    }
    let bodyMessage;
    // @ts-ignore: Unreachable code error
    if (sendSignature && !(0, lodash_1.isNil)(user)) {
        bodyMessage = `*${user.name}:*\n${body.trim()}`;
    }
    else {
        bodyMessage = body.trim();
    }
    if (noRegister) {
        if (medias) {
            try {
                // console.log(medias)
                await Promise.all(medias.map(async (media) => {
                    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "public");
                    const filePath = path_1.default.join(publicFolder, `company${companyId}`, media.filename);
                    const options = await (0, SendWhatsAppMedia_1.getMessageOptions)(media.filename, filePath, companyId.toString(), `\u200e ${bodyMessage}`);
                    await wbot.sendMessage(`${newContact.number}@${newContact.number.length > 17 ? "g.us" : "s.whatsapp.net"}`, options);
                    const fileExists = fs_1.default.existsSync(filePath);
                    if (fileExists) {
                        fs_1.default.unlinkSync(filePath);
                    }
                }));
            }
            catch (error) {
                console.log(medias);
                throw new AppError_1.default("Error sending API media: " + error.message);
            }
        }
        else {
            await wbot.sendMessage(`${newContact.number}@${newContact.number.length > 17 ? "g.us" : "s.whatsapp.net"}`, {
                text: `\u200e ${bodyMessage}`
            });
        }
    }
    else {
        const contactAndTicket = await createContact(whatsapp.id, companyId, newContact.number, userId, queueId, wbot);
        let sentMessage;
        if (medias) {
            try {
                await Promise.all(medias.map(async (media) => {
                    sentMessage = await (0, SendWhatsAppMedia_1.default)({ body: `\u200e ${bodyMessage}`, media, ticket: contactAndTicket, isForwarded: false });
                    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "public");
                    const filePath = path_1.default.join(publicFolder, `company${companyId}`, media.filename);
                    const fileExists = fs_1.default.existsSync(filePath);
                    if (fileExists) {
                        fs_1.default.unlinkSync(filePath);
                    }
                }));
                await (0, wbotMessageListener_1.verifyMediaMessage)(sentMessage, contactAndTicket, contactAndTicket.contact, null, false, false, wbot);
            }
            catch (error) {
                throw new AppError_1.default("Error sending API media: " + error.message);
            }
        }
        else {
            sentMessage = await (0, SendWhatsAppMessageAPI_1.default)({ body: `\u200e ${bodyMessage}`, whatsappId: whatsapp.id, contact: contactAndTicket.contact, quotedMsg, msdelay });
            await (0, wbotMessageListener_1.verifyMessage)(sentMessage, contactAndTicket, contactAndTicket.contact);
        }
        // @ts-ignore: Unreachable code error
        if (closeTicket) {
            setTimeout(async () => {
                await (0, UpdateTicketService_1.default)({
                    ticketId: contactAndTicket.id,
                    ticketData: { status: "closed", sendFarewellMessage: false, amountUsedBotQueues: 0, lastMessage: body },
                    companyId,
                });
            }, 100);
        }
        else if (userId?.toString() !== "" && !isNaN(userId)) {
            setTimeout(async () => {
                await (0, UpdateTicketService_1.default)({
                    ticketId: contactAndTicket.id,
                    ticketData: { status: "open", amountUsedBotQueues: 0, lastMessage: body, userId, queueId },
                    companyId,
                });
            }, 100);
        }
    }
    setTimeout(async () => {
        const { dateToClient } = (0, useDate_1.useDate)();
        const hoje = dateToClient(new Date());
        const timestamp = (0, moment_1.default)().format();
        let exist = await ApiUsages_1.default.findOne({
            where: {
                dateUsed: hoje,
                companyId: companyId
            }
        });
        if (exist) {
            if (medias) {
                await Promise.all(medias.map(async (media) => {
                    // const type = path.extname(media.originalname.replace('/','-'))
                    if (media.mimetype.includes("pdf")) {
                        await exist.update({
                            usedPDF: exist.dataValues["usedPDF"] + 1,
                            UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                            updatedAt: timestamp
                        });
                    }
                    else if (media.mimetype.includes("image")) {
                        await exist.update({
                            usedImage: exist.dataValues["usedImage"] + 1,
                            UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                            updatedAt: timestamp
                        });
                    }
                    else if (media.mimetype.includes("video")) {
                        await exist.update({
                            usedVideo: exist.dataValues["usedVideo"] + 1,
                            UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                            updatedAt: timestamp
                        });
                    }
                    else {
                        await exist.update({
                            usedOther: exist.dataValues["usedOther"] + 1,
                            UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                            updatedAt: timestamp
                        });
                    }
                }));
            }
            else {
                await exist.update({
                    usedText: exist.dataValues["usedText"] + 1,
                    UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                    updatedAt: timestamp
                });
            }
        }
        else {
            exist = await ApiUsages_1.default.create({
                companyId: companyId,
                dateUsed: hoje,
            });
            if (medias) {
                await Promise.all(medias.map(async (media) => {
                    // const type = path.extname(media.originalname.replace('/','-'))
                    if (media.mimetype.includes("pdf")) {
                        await exist.update({
                            usedPDF: exist.dataValues["usedPDF"] + 1,
                            UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                            updatedAt: timestamp
                        });
                    }
                    else if (media.mimetype.includes("image")) {
                        await exist.update({
                            usedImage: exist.dataValues["usedImage"] + 1,
                            UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                            updatedAt: timestamp
                        });
                    }
                    else if (media.mimetype.includes("video")) {
                        await exist.update({
                            usedVideo: exist.dataValues["usedVideo"] + 1,
                            UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                            updatedAt: timestamp
                        });
                    }
                    else {
                        await exist.update({
                            usedOther: exist.dataValues["usedOther"] + 1,
                            UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                            updatedAt: timestamp
                        });
                    }
                }));
            }
            else {
                await exist.update({
                    usedText: exist.dataValues["usedText"] + 1,
                    UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                    updatedAt: timestamp
                });
            }
        }
    }, 100);
    return res.send({ status: "SUCCESS" });
};
exports.index = index;
const indexImage = async (req, res) => {
    const newContact = req.body;
    const { whatsappId } = req.body;
    const { msdelay } = req.body;
    const url = req.body.url;
    const caption = req.body.caption;
    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");
    const whatsapp = await Whatsapp_1.default.findOne({ where: { token } });
    const companyId = whatsapp.companyId;
    newContact.number = newContact.number.replace("-", "").replace(" ", "");
    const schema = Yup.object().shape({
        number: Yup.string()
            .required()
            .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
    });
    try {
        await schema.validate(newContact);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const contactAndTicket = await createContact(whatsappId, companyId, newContact.number);
    if (url) {
        await (0, SendWhatsappMediaImage_1.default)({ ticket: contactAndTicket, url, caption, msdelay });
    }
    setTimeout(async () => {
        await (0, UpdateTicketService_1.default)({
            ticketId: contactAndTicket.id,
            ticketData: { status: "closed", sendFarewellMessage: false, amountUsedBotQueues: 0 },
            companyId
        });
    }, 100);
    setTimeout(async () => {
        const { dateToClient } = (0, useDate_1.useDate)();
        const hoje = dateToClient(new Date());
        const timestamp = (0, moment_1.default)().format();
        const exist = await ApiUsages_1.default.findOne({
            where: {
                dateUsed: hoje,
                companyId: companyId
            }
        });
        if (exist) {
            await exist.update({
                usedImage: exist.dataValues["usedImage"] + 1,
                UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
            });
        }
        else {
            const usage = await ApiUsages_1.default.create({
                companyId: companyId,
                dateUsed: hoje,
            });
            await usage.update({
                usedImage: usage.dataValues["usedImage"] + 1,
                UsedOnDay: usage.dataValues["UsedOnDay"] + 1,
                updatedAt: timestamp
            });
        }
    }, 100);
    return res.send({ status: "SUCCESS" });
};
exports.indexImage = indexImage;
const checkNumber = async (req, res) => {
    const newContact = req.body;
    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");
    const whatsapp = await Whatsapp_1.default.findOne({ where: { token } });
    const companyId = whatsapp.companyId;
    const number = newContact.number.replace("-", "").replace(" ", "");
    const whatsappDefault = await (0, GetDefaultWhatsApp_1.default)(whatsapp.id, companyId);
    const wbot = (0, wbot_1.getWbot)(whatsappDefault.id);
    const jid = createJid(number);
    try {
        const [result] = (await wbot.onWhatsApp(jid));
        if (result.exists) {
            setTimeout(async () => {
                const { dateToClient } = (0, useDate_1.useDate)();
                const hoje = dateToClient(new Date());
                const timestamp = (0, moment_1.default)().format();
                const exist = await ApiUsages_1.default.findOne({
                    where: {
                        dateUsed: hoje,
                        companyId: companyId
                    }
                });
                if (exist) {
                    await exist.update({
                        usedCheckNumber: exist.dataValues["usedCheckNumber"] + 1,
                        UsedOnDay: exist.dataValues["UsedOnDay"] + 1,
                        updatedAt: timestamp
                    });
                }
                else {
                    const usage = await ApiUsages_1.default.create({
                        companyId: companyId,
                        dateUsed: hoje,
                    });
                    await usage.update({
                        usedCheckNumber: usage.dataValues["usedCheckNumber"] + 1,
                        UsedOnDay: usage.dataValues["UsedOnDay"] + 1,
                        updatedAt: timestamp
                    });
                }
            }, 100);
            return res.status(200).json({ existsInWhatsapp: true, number: number, numberFormatted: result.jid });
        }
    }
    catch (error) {
        return res.status(400).json({ existsInWhatsapp: false, number: jid, error: "Not exists on Whatsapp" });
    }
};
exports.checkNumber = checkNumber;
const indexWhatsappsId = async (req, res) => {
    return res.status(200).json('oi');
    // const { companyId } = req.user;
    // const whatsapps = await ListWhatsAppsService({ companyId });
    // let wpp = [];
    // if (whatsapps.length > 0) {
    //     whatsapps.forEach(whatsapp => {
    //         let wppString;
    //         wppString = {
    //             id: whatsapp.id,
    //             name: whatsapp.name,
    //             status: whatsapp.status,
    //             isDefault: whatsapp.isDefault,
    //             number: whatsapp.number
    //         }
    //         wpp.push(wppString)
    //     });
    // }
    // return res.status(200).json(wpp);
};
exports.indexWhatsappsId = indexWhatsappsId;
