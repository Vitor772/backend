"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAdmin = exports.removeAdmin = exports.updateAdmin = exports.listAll = exports.restart = exports.remove = exports.closedTickets = exports.update = exports.show = exports.storeFacebook = exports.store = exports.indexFilter = exports.index = void 0;
const socket_1 = require("../libs/socket");
const cache_1 = __importDefault(require("../libs/cache"));
const wbot_1 = require("../libs/wbot");
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const DeleteBaileysService_1 = __importDefault(require("../services/BaileysServices/DeleteBaileysService"));
const ShowCompanyService_1 = __importDefault(require("../services/CompanyService/ShowCompanyService"));
const graphAPI_1 = require("../services/FacebookServices/graphAPI");
const ShowPlanService_1 = __importDefault(require("../services/PlanService/ShowPlanService"));
const StartWhatsAppSession_1 = require("../services/WbotServices/StartWhatsAppSession");
const CreateWhatsAppService_1 = __importDefault(require("../services/WhatsappService/CreateWhatsAppService"));
const DeleteWhatsAppService_1 = __importDefault(require("../services/WhatsappService/DeleteWhatsAppService"));
const ListWhatsAppsService_1 = __importDefault(require("../services/WhatsappService/ListWhatsAppsService"));
const ShowWhatsAppService_1 = __importDefault(require("../services/WhatsappService/ShowWhatsAppService"));
const UpdateWhatsAppService_1 = __importDefault(require("../services/WhatsappService/UpdateWhatsAppService"));
const ImportWhatsAppMessageService_1 = require("../services/WhatsappService/ImportWhatsAppMessageService");
const ShowWhatsAppServiceAdmin_1 = __importDefault(require("../services/WhatsappService/ShowWhatsAppServiceAdmin"));
const UpdateWhatsAppServiceAdmin_1 = __importDefault(require("../services/WhatsappService/UpdateWhatsAppServiceAdmin"));
const ListAllWhatsAppService_1 = __importDefault(require("../services/WhatsappService/ListAllWhatsAppService"));
const ListFilterWhatsAppsService_1 = __importDefault(require("../services/WhatsappService/ListFilterWhatsAppsService"));
const User_1 = __importDefault(require("../models/User"));
const index = async (req, res) => {
    const { companyId } = req.user;
    const { session } = req.query;
    const whatsapps = await (0, ListWhatsAppsService_1.default)({ companyId, session });
    return res.status(200).json(whatsapps);
};
exports.index = index;
const indexFilter = async (req, res) => {
    const { companyId } = req.user;
    const { session, channel } = req.query;
    const whatsapps = await (0, ListFilterWhatsAppsService_1.default)({ companyId, session, channel });
    return res.status(200).json(whatsapps);
};
exports.indexFilter = indexFilter;
const store = async (req, res) => {
    const { name, status, isDefault, greetingMessage, complationMessage, outOfHoursMessage, queueIds, token, maxUseBotQueues, timeUseBotQueues, expiresTicket, allowGroup, timeSendQueue, sendIdQueue, timeInactiveMessage, inactiveMessage, ratingMessage, maxUseBotQueuesNPS, expiresTicketNPS, whenExpiresTicket, expiresInactiveMessage, importOldMessages, importRecentMessages, closedTicketsPostImported, importOldMessagesGroups, groupAsTicket, timeCreateNewTicket, schedules, promptId, collectiveVacationEnd, collectiveVacationMessage, collectiveVacationStart, queueIdImportMessages, flowIdNotPhrase, flowIdWelcome } = req.body;
    const { companyId } = req.user;
    const company = await (0, ShowCompanyService_1.default)(companyId);
    const plan = await (0, ShowPlanService_1.default)(company.planId);
    if (!plan.useWhatsapp) {
        return res.status(400).json({
            error: "Você não possui permissão para acessar este recurso!"
        });
    }
    console.log("================ WhatsAppController ==============");
    console.log(req.body);
    console.log("==================================================");
    const { whatsapp, oldDefaultWhatsapp } = await (0, CreateWhatsAppService_1.default)({
        name,
        status,
        isDefault,
        greetingMessage,
        complationMessage,
        outOfHoursMessage,
        queueIds,
        companyId,
        token,
        maxUseBotQueues,
        timeUseBotQueues,
        expiresTicket,
        allowGroup,
        timeSendQueue,
        sendIdQueue,
        timeInactiveMessage,
        inactiveMessage,
        ratingMessage,
        maxUseBotQueuesNPS,
        expiresTicketNPS,
        whenExpiresTicket,
        expiresInactiveMessage,
        importOldMessages,
        importRecentMessages,
        closedTicketsPostImported,
        importOldMessagesGroups,
        groupAsTicket,
        timeCreateNewTicket,
        schedules,
        promptId,
        collectiveVacationEnd,
        collectiveVacationMessage,
        collectiveVacationStart,
        queueIdImportMessages,
        flowIdNotPhrase,
        flowIdWelcome
    });
    (0, StartWhatsAppSession_1.StartWhatsAppSession)(whatsapp, companyId);
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp
    });
    if (oldDefaultWhatsapp) {
        io.of(String(companyId))
            .emit(`company-${companyId}-whatsapp`, {
            action: "update",
            whatsapp: oldDefaultWhatsapp
        });
    }
    return res.status(200).json(whatsapp);
};
exports.store = store;
const storeFacebook = async (req, res) => {
    try {
        const { facebookUserId, facebookUserToken, addInstagram } = req.body;
        const { companyId } = req.user;
        // const company = await ShowCompanyService(companyId)
        // const plan = await ShowPlanService(company.planId);
        // if (!plan.useFacebook) {
        //   return res.status(400).json({
        //     error: "Você não possui permissão para acessar este recurso!"
        //   });
        // }
        const { data } = await (0, graphAPI_1.getPageProfile)(facebookUserId, facebookUserToken);
        if (data.length === 0) {
            return res.status(400).json({
                error: "Facebook page not found 1"
            });
        }
        const io = (0, socket_1.getIO)();
        const pages = [];
        for await (const page of data) {
            const { name, access_token, id, instagram_business_account } = page;
            const acessTokenPage = await (0, graphAPI_1.getAccessTokenFromPage)(access_token);
            if (instagram_business_account && addInstagram) {
                const { id: instagramId, username, name: instagramName } = instagram_business_account;
                pages.push({
                    companyId,
                    name: `Insta ${username || instagramName}`,
                    facebookUserId: facebookUserId,
                    facebookPageUserId: instagramId,
                    facebookUserToken: acessTokenPage,
                    tokenMeta: facebookUserToken,
                    isDefault: false,
                    channel: "instagram",
                    status: "CONNECTED",
                    greetingMessage: "",
                    farewellMessage: "",
                    queueIds: [],
                    isMultidevice: false
                });
                pages.push({
                    companyId,
                    name,
                    facebookUserId: facebookUserId,
                    facebookPageUserId: id,
                    facebookUserToken: acessTokenPage,
                    tokenMeta: facebookUserToken,
                    isDefault: false,
                    channel: "facebook",
                    status: "CONNECTED",
                    greetingMessage: "",
                    farewellMessage: "",
                    queueIds: [],
                    isMultidevice: false
                });
                await (0, graphAPI_1.subscribeApp)(id, acessTokenPage);
            }
            if (!instagram_business_account) {
                pages.push({
                    companyId,
                    name,
                    facebookUserId: facebookUserId,
                    facebookPageUserId: id,
                    facebookUserToken: acessTokenPage,
                    tokenMeta: facebookUserToken,
                    isDefault: false,
                    channel: "facebook",
                    status: "CONNECTED",
                    greetingMessage: "",
                    farewellMessage: "",
                    queueIds: [],
                    isMultidevice: false
                });
                await (0, graphAPI_1.subscribeApp)(page.id, acessTokenPage);
            }
        }
        for await (const pageConection of pages) {
            const exist = await Whatsapp_1.default.findOne({
                where: {
                    facebookPageUserId: pageConection.facebookPageUserId
                }
            });
            if (exist) {
                await exist.update({
                    ...pageConection
                });
            }
            if (!exist) {
                const { whatsapp } = await (0, CreateWhatsAppService_1.default)(pageConection);
                io.of(String(companyId))
                    .emit(`company-${companyId}-whatsapp`, {
                    action: "update",
                    whatsapp
                });
            }
        }
        return res.status(200);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            error: "Facebook page not found 2"
        });
    }
};
exports.storeFacebook = storeFacebook;
const show = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    const { session } = req.query;
    // console.log("SHOWING WHATSAPP", whatsappId)
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId, session);
    return res.status(200).json(whatsapp);
};
exports.show = show;
const update = async (req, res) => {
    const { whatsappId } = req.params;
    const whatsappData = req.body;
    const { companyId } = req.user;
    const { whatsapp, oldDefaultWhatsapp } = await (0, UpdateWhatsAppService_1.default)({
        whatsappData,
        whatsappId,
        companyId
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp
    });
    if (oldDefaultWhatsapp) {
        io.of(String(companyId))
            .emit(`company-${companyId}-whatsapp`, {
            action: "update",
            whatsapp: oldDefaultWhatsapp
        });
    }
    return res.status(200).json(whatsapp);
};
exports.update = update;
const closedTickets = async (req, res) => {
    const { whatsappId } = req.params;
    (0, ImportWhatsAppMessageService_1.closeTicketsImported)(whatsappId);
    return res.status(200).json("whatsapp");
};
exports.closedTickets = closedTickets;
const remove = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId, profile } = req.user;
    const io = (0, socket_1.getIO)();
    if (profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    console.log("REMOVING WHATSAPP", whatsappId);
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    if (whatsapp.channel === "whatsapp") {
        await (0, DeleteBaileysService_1.default)(whatsappId);
        await (0, DeleteWhatsAppService_1.default)(whatsappId);
        await cache_1.default.delFromPattern(`sessions:${whatsappId}:*`);
        (0, wbot_1.removeWbot)(+whatsappId);
        io.of(String(companyId))
            .emit(`company-${companyId}-whatsapp`, {
            action: "delete",
            whatsappId: +whatsappId
        });
    }
    if (whatsapp.channel === "facebook" || whatsapp.channel === "instagram") {
        const { facebookUserToken } = whatsapp;
        const getAllSameToken = await Whatsapp_1.default.findAll({
            where: {
                facebookUserToken
            }
        });
        await Whatsapp_1.default.destroy({
            where: {
                facebookUserToken
            }
        });
        for await (const whatsapp of getAllSameToken) {
            io.of(String(companyId))
                .emit(`company-${companyId}-whatsapp`, {
                action: "delete",
                whatsappId: whatsapp.id
            });
        }
    }
    return res.status(200).json({ message: "Session disconnected." });
};
exports.remove = remove;
const restart = async (req, res) => {
    const { companyId, profile, id } = req.user;
    const user = await User_1.default.findByPk(id);
    const { allowConnections } = user;
    if (profile !== "admin" && allowConnections === "disabled") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    await (0, wbot_1.restartWbot)(companyId);
    return res.status(200).json({ message: "Whatsapp restart." });
};
exports.restart = restart;
const listAll = async (req, res) => {
    const { companyId } = req.user;
    const { session } = req.query;
    const whatsapps = await (0, ListAllWhatsAppService_1.default)({ session });
    return res.status(200).json(whatsapps);
};
exports.listAll = listAll;
const updateAdmin = async (req, res) => {
    const { whatsappId } = req.params;
    const whatsappData = req.body;
    const { companyId } = req.user;
    const { whatsapp, oldDefaultWhatsapp } = await (0, UpdateWhatsAppServiceAdmin_1.default)({
        whatsappData,
        whatsappId,
        companyId
    });
    const io = (0, socket_1.getIO)();
    io.of(String(companyId))
        .emit(`admin-whatsapp`, {
        action: "update",
        whatsapp
    });
    if (oldDefaultWhatsapp) {
        io.of(String(companyId))
            .emit(`admin-whatsapp`, {
            action: "update",
            whatsapp: oldDefaultWhatsapp
        });
    }
    return res.status(200).json(whatsapp);
};
exports.updateAdmin = updateAdmin;
const removeAdmin = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    const io = (0, socket_1.getIO)();
    console.log("REMOVING WHATSAPP ADMIN", whatsappId);
    const whatsapp = await (0, ShowWhatsAppService_1.default)(whatsappId, companyId);
    if (whatsapp.channel === "whatsapp") {
        await (0, DeleteBaileysService_1.default)(whatsappId);
        await (0, DeleteWhatsAppService_1.default)(whatsappId);
        await cache_1.default.delFromPattern(`sessions:${whatsappId}:*`);
        (0, wbot_1.removeWbot)(+whatsappId);
        io.of(String(companyId))
            .emit(`admin-whatsapp`, {
            action: "delete",
            whatsappId: +whatsappId
        });
    }
    if (whatsapp.channel === "facebook" || whatsapp.channel === "instagram") {
        const { facebookUserToken } = whatsapp;
        const getAllSameToken = await Whatsapp_1.default.findAll({
            where: {
                facebookUserToken
            }
        });
        await Whatsapp_1.default.destroy({
            where: {
                facebookUserToken
            }
        });
        for await (const whatsapp of getAllSameToken) {
            io.of(String(companyId))
                .emit(`company-${companyId}-whatsapp`, {
                action: "delete",
                whatsappId: whatsapp.id
            });
        }
    }
    return res.status(200).json({ message: "Session disconnected." });
};
exports.removeAdmin = removeAdmin;
const showAdmin = async (req, res) => {
    const { whatsappId } = req.params;
    const { companyId } = req.user;
    // console.log("SHOWING WHATSAPP ADMIN", whatsappId)
    const whatsapp = await (0, ShowWhatsAppServiceAdmin_1.default)(whatsappId);
    return res.status(200).json(whatsapp);
};
exports.showAdmin = showAdmin;
