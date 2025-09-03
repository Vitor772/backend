"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClosedAllOpenTickets = void 0;
const sequelize_1 = require("sequelize");
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const socket_1 = require("../../libs/socket");
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const SendWhatsAppMessage_1 = __importDefault(require("./SendWhatsAppMessage"));
const moment_1 = __importDefault(require("moment"));
const wbotMessageListener_1 = require("./wbotMessageListener");
const TicketTraking_1 = __importDefault(require("../../models/TicketTraking"));
const CreateLogTicketService_1 = __importDefault(require("../TicketServices/CreateLogTicketService"));
const logger_1 = __importDefault(require("../../utils/logger"));
const lodash_1 = require("lodash");
const date_fns_1 = require("date-fns");
const closeTicket = async (ticket, body) => {
    await ticket.update({
        status: "closed",
        lastMessage: body,
        unreadMessages: 0,
        amountUsedBotQueues: 0
    });
    await (0, CreateLogTicketService_1.default)({
        userId: ticket.userId || null,
        queueId: ticket.queueId || null,
        ticketId: ticket.id,
        type: "autoClose"
    });
};
const handleOpenTickets = async (companyId, whatsapp) => {
    const currentTime = new Date();
    const brazilTimeZoneOffset = -3 * 60; // Fuso horário do Brasil é UTC-3
    const currentTimeBrazil = new Date(currentTime.getTime() + brazilTimeZoneOffset * 60000); // Adiciona o offset ao tempo atual
    let timeInactiveMessage = Number(whatsapp.timeInactiveMessage || 0);
    let expiresTime = Number(whatsapp.expiresTicket || 0);
    if (!(0, lodash_1.isNil)(expiresTime) && expiresTime > 0) {
        if (!(0, lodash_1.isNil)(timeInactiveMessage) && timeInactiveMessage > 0) {
            let whereCondition1;
            whereCondition1 = {
                status: "open",
                companyId,
                whatsappId: whatsapp.id,
                updatedAt: {
                    [sequelize_1.Op.lt]: +(0, date_fns_1.sub)(new Date(), {
                        minutes: Number(timeInactiveMessage)
                    })
                },
                imported: null,
                sendInactiveMessage: false
            };
            if (Number(whatsapp.whenExpiresTicket) === 1) {
                whereCondition1 = {
                    ...whereCondition1,
                    fromMe: true
                };
            }
            const ticketsForInactiveMessage = await Ticket_1.default.findAll({
                where: whereCondition1
            });
            if (ticketsForInactiveMessage && ticketsForInactiveMessage.length > 0) {
                logger_1.default.info(`Encontrou ${ticketsForInactiveMessage.length} atendimentos para enviar mensagem de inatividade na empresa ${companyId}- na conexão ${whatsapp.name}!`);
                await Promise.all(ticketsForInactiveMessage.map(async (ticket) => {
                    await ticket.reload();
                    if (!ticket.sendInactiveMessage) {
                        const bodyMessageInactive = (0, Mustache_1.default)(`\u200e ${whatsapp.inactiveMessage}`, ticket);
                        const sentMessage = await (0, SendWhatsAppMessage_1.default)({ body: bodyMessageInactive, ticket: ticket });
                        await (0, wbotMessageListener_1.verifyMessage)(sentMessage, ticket, ticket.contact);
                        await ticket.update({ sendInactiveMessage: true, fromMe: true });
                    }
                }));
            }
            expiresTime += timeInactiveMessage; // Adicionando o tempo de inatividade ao tempo de expiração
        }
        let whereCondition;
        whereCondition = {
            status: "open",
            companyId,
            whatsappId: whatsapp.id,
            updatedAt: {
                [sequelize_1.Op.lt]: +(0, date_fns_1.sub)(new Date(), {
                    minutes: Number(expiresTime)
                })
            },
            imported: null
        };
        if (timeInactiveMessage > 0) {
            whereCondition = {
                ...whereCondition,
                sendInactiveMessage: true,
            };
        }
        if (Number(whatsapp.whenExpiresTicket) === 1) {
            whereCondition = {
                ...whereCondition,
                fromMe: true
            };
        }
        const ticketsToClose = await Ticket_1.default.findAll({
            where: whereCondition
        });
        if (ticketsToClose && ticketsToClose.length > 0) {
            logger_1.default.info(`Encontrou ${ticketsToClose.length} atendimentos para encerrar na empresa ${companyId} - na conexão ${whatsapp.name}!`);
            for (const ticket of ticketsToClose) {
                await ticket.reload();
                const ticketTraking = await TicketTraking_1.default.findOne({
                    where: { ticketId: ticket.id, finishedAt: null }
                });
                let bodyExpiresMessageInactive = "";
                if (!(0, lodash_1.isNil)(whatsapp.expiresInactiveMessage) && whatsapp.expiresInactiveMessage !== "") {
                    bodyExpiresMessageInactive = (0, Mustache_1.default)(`\u200e${whatsapp.expiresInactiveMessage}`, ticket);
                    const sentMessage = await (0, SendWhatsAppMessage_1.default)({ body: bodyExpiresMessageInactive, ticket: ticket });
                    await (0, wbotMessageListener_1.verifyMessage)(sentMessage, ticket, ticket.contact);
                }
                // Como o campo sendInactiveMessage foi atualizado, podemos garantir que a mensagem foi enviada
                await closeTicket(ticket, bodyExpiresMessageInactive);
                await ticketTraking.update({
                    finishedAt: new Date(),
                    closedAt: new Date(),
                    whatsappId: ticket.whatsappId,
                    userId: ticket.userId,
                });
                // console.log("emitiu socket 144", ticket.id)
                const io = (0, socket_1.getIO)();
                io.of(companyId.toString()).emit(`company-${companyId}-ticket`, {
                    action: "delete",
                    ticketId: ticket.id
                });
            }
        }
    }
};
const handleNPSTickets = async (companyId, whatsapp) => {
    const expiresTime = Number(whatsapp.expiresTicketNPS);
    const dataLimite = (0, moment_1.default)().subtract(expiresTime, 'minutes');
    const ticketsToClose = await Ticket_1.default.findAll({
        where: {
            status: "nps",
            companyId,
            whatsappId: whatsapp.id,
            updatedAt: { [sequelize_1.Op.lt]: dataLimite.toDate() },
            imported: null
        }
    });
    if (ticketsToClose && ticketsToClose.length > 0) {
        logger_1.default.info(`Encontrou ${ticketsToClose.length} atendimentos para encerrar NPS na empresa ${companyId} - na conexão ${whatsapp.name}!`);
        await Promise.all(ticketsToClose.map(async (ticket) => {
            await ticket.reload();
            const ticketTraking = await TicketTraking_1.default.findOne({
                where: { ticketId: ticket.id, finishedAt: null }
            });
            let bodyComplationMessage = "";
            if (!(0, lodash_1.isNil)(whatsapp.complationMessage) && whatsapp.complationMessage !== "") {
                bodyComplationMessage = (0, Mustache_1.default)(`\u200e${whatsapp.complationMessage}`, ticket);
                const sentMessage = await (0, SendWhatsAppMessage_1.default)({ body: bodyComplationMessage, ticket: ticket });
                await (0, wbotMessageListener_1.verifyMessage)(sentMessage, ticket, ticket.contact);
            }
            await closeTicket(ticket, bodyComplationMessage);
            await ticketTraking.update({
                finishedAt: (0, moment_1.default)().toDate(),
                closedAt: (0, moment_1.default)().toDate(),
                whatsappId: ticket.whatsappId,
                userId: ticket.userId,
            });
            (0, socket_1.getIO)().of(companyId.toString()).emit(`company-${companyId}-ticket`, {
                action: "delete",
                ticketId: ticket.id
            });
        }));
    }
};
const ClosedAllOpenTickets = async (companyId) => {
    try {
        const whatsapps = await Whatsapp_1.default.findAll({
            attributes: ["id", "name", "status", "timeSendQueue", "sendIdQueue", "timeInactiveMessage",
                "expiresInactiveMessage", "inactiveMessage", "expiresTicket", "expiresTicketNPS", "whenExpiresTicket",
                "complationMessage"],
            where: {
                [sequelize_1.Op.or]: [
                    { expiresTicket: { [sequelize_1.Op.gt]: '0' } },
                    { expiresTicketNPS: { [sequelize_1.Op.gt]: '0' } }
                ],
                companyId: companyId,
                status: "CONNECTED"
            }
        });
        // Agora você pode iterar sobre as instâncias de Whatsapp diretamente
        if (whatsapps.length > 0) {
            for (const whatsapp of whatsapps) {
                if (whatsapp.expiresTicket) {
                    await handleOpenTickets(companyId, whatsapp);
                }
                if (whatsapp.expiresTicketNPS) {
                    await handleNPSTickets(companyId, whatsapp);
                }
            }
        }
    }
    catch (error) {
        console.error('Erro:', error);
    }
};
exports.ClosedAllOpenTickets = ClosedAllOpenTickets;
