"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const date_fns_1 = require("date-fns");
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const ShowTicketService_1 = __importDefault(require("./ShowTicketService"));
const lodash_1 = require("lodash");
const socket_1 = require("../../libs/socket");
const CreateLogTicketService_1 = __importDefault(require("./CreateLogTicketService"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// interface Response {
//   ticket: Ticket;
//   // isCreated: boolean;
// }
const FindOrCreateTicketService = async (contact, whatsapp, unreadMessages, companyId, queueId = null, userId = null, groupContact, channel, isImported, isForward, settings, isTransfered, isCampaign = false) => {
    // try {
    // let isCreated = false;
    let openAsLGPD = false;
    if (settings.enableLGPD) { //adicionar lgpdMessage
        openAsLGPD = !isCampaign &&
            !isTransfered &&
            settings.enableLGPD === "enabled" &&
            settings.lgpdMessage !== "" &&
            (settings.lgpdConsent === "enabled" ||
                (settings.lgpdConsent === "disabled" && (0, lodash_1.isNil)(contact?.lgpdAcceptedAt)));
    }
    const io = (0, socket_1.getIO)();
    const DirectTicketsToWallets = settings.DirectTicketsToWallets;
    let ticket = await Ticket_1.default.findOne({
        where: {
            status: {
                [sequelize_1.Op.or]: ["open", "pending", "group", "nps", "lgpd"]
            },
            contactId: groupContact ? groupContact.id : contact.id,
            companyId,
            whatsappId: whatsapp.id
        },
        order: [["id", "DESC"]]
    });
    if (ticket) {
        if (isCampaign) {
            await ticket.update({
                userId: userId !== ticket.userId ? ticket.userId : userId,
                queueId: queueId !== ticket.queueId ? ticket.queueId : queueId,
            });
        }
        else {
            await ticket.update({ unreadMessages, isBot: false });
        }
        ticket = await (0, ShowTicketService_1.default)(ticket.id, companyId);
        // console.log(ticket.id)
        if (!isCampaign && !isForward) {
            // @ts-ignore: Unreachable code error
            if ((Number(ticket?.userId) !== Number(userId) && userId !== 0 && userId !== "" && userId !== "0" && !(0, lodash_1.isNil)(userId) && !ticket.isGroup)
                // @ts-ignore: Unreachable code error 
                || (queueId !== 0 && Number(ticket?.queueId) !== Number(queueId) && queueId !== "" && queueId !== "0" && !(0, lodash_1.isNil)(queueId))) {
                throw new AppError_1.default(`Ticket em outro atendimento. ${"Atendente: " + ticket?.user?.name} - ${"Fila: " + ticket?.queue?.name}`);
            }
        }
        // isCreated = true;
        return ticket;
    }
    const timeCreateNewTicket = whatsapp.timeCreateNewTicket;
    if (!ticket && timeCreateNewTicket !== 0) {
        // @ts-ignore: Unreachable code error
        if (timeCreateNewTicket !== 0 && timeCreateNewTicket !== "0") {
            ticket = await Ticket_1.default.findOne({
                where: {
                    updatedAt: {
                        [sequelize_1.Op.between]: [
                            +(0, date_fns_1.sub)(new Date(), {
                                minutes: Number(timeCreateNewTicket)
                            }),
                            +new Date()
                        ]
                    },
                    contactId: contact.id,
                    companyId,
                    whatsappId: whatsapp.id
                },
                order: [["updatedAt", "DESC"]]
            });
        }
        if (ticket && ticket.status !== "nps") {
            await ticket.update({
                status: "pending",
                unreadMessages,
                companyId,
                // queueId: timeCreateNewTicket === 0 ? null : ticket.queueId
            });
        }
    }
    if (!ticket) {
        const ticketData = {
            contactId: groupContact ? groupContact.id : contact.id,
            status: (!isImported && !(0, lodash_1.isNil)(settings.enableLGPD)
                && openAsLGPD && !groupContact) ? //verifica se lgpd está habilitada e não é grupo e se tem a mensagem e link da política
                "lgpd" : //abre como LGPD caso habilitado parâmetro
                (whatsapp.groupAsTicket === "enabled" || !groupContact) ? // se lgpd estiver desabilitado, verifica se é para tratar ticket como grupo ou se é contato normal
                    "pending" : //caso  é para tratar grupo como ticket ou não é grupo, abre como pendente
                    "group",
            isGroup: !!groupContact,
            unreadMessages,
            whatsappId: whatsapp.id,
            companyId,
            isBot: groupContact ? false : true,
            channel,
            imported: isImported ? new Date() : null,
            isActiveDemand: false,
        };
        if (DirectTicketsToWallets && contact.id) {
            const wallet = contact;
            const wallets = await wallet.getWallets();
            if (wallets && wallets[0]?.id) {
                ticketData.status = (!isImported && !(0, lodash_1.isNil)(settings.enableLGPD)
                    && openAsLGPD && !groupContact) ? //verifica se lgpd está habilitada e não é grupo e se tem a mensagem e link da política
                    "lgpd" : //abre como LGPD caso habilitado parâmetro
                    (whatsapp.groupAsTicket === "enabled" || !groupContact) ? // se lgpd estiver desabilitado, verifica se é para tratar ticket como grupo ou se é contato normal
                        "open" : //caso  é para tratar grupo como ticket ou não é grupo, abre como pendente
                        "group", // se não é para tratar grupo como ticket, vai direto para grupos
                    ticketData.userId = wallets[0].id;
            }
        }
        ticket = await Ticket_1.default.create(ticketData);
        // await FindOrCreateATicketTrakingService({
        //   ticketId: ticket.id,
        //   companyId,
        //   whatsappId: whatsapp.id,
        //   userId: userId ? userId : ticket.userId
        // });
    }
    if (queueId != 0 && !(0, lodash_1.isNil)(queueId)) {
        //Determina qual a fila esse ticket pertence.
        await ticket.update({ queueId: queueId });
    }
    if (userId != 0 && !(0, lodash_1.isNil)(userId)) {
        //Determina qual a fila esse ticket pertence.
        await ticket.update({ userId: userId });
    }
    ticket = await (0, ShowTicketService_1.default)(ticket.id, companyId);
    await (0, CreateLogTicketService_1.default)({
        ticketId: ticket.id,
        type: openAsLGPD ? "lgpd" : "create"
    });
    return ticket;
};
exports.default = FindOrCreateTicketService;
