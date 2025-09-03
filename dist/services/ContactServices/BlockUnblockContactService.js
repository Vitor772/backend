"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const wbot_1 = require("../../libs/wbot");
const Contact_1 = __importDefault(require("../../models/Contact"));
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
const BlockUnblockContactService = async ({ contactId, companyId, active }) => {
    const contact = await Contact_1.default.findByPk(contactId);
    if (!contact) {
        throw new AppError_1.default("ERR_NO_CONTACT_FOUND", 404);
    }
    // console.log('active', active)
    // console.log('companyId', companyId)
    // console.log('contact.number', contact.number)
    if (active) {
        try {
            //const whatsappCompany = await GetDefaultWhatsApp(Number(companyId))
            const whatsappCompany = null;
            const wbot = (0, wbot_1.getWbot)(whatsappCompany.id);
            const jid = createJid(contact.number);
            await wbot.updateBlockStatus(jid, "unblock");
            await contact.update({ active: true });
        }
        catch (error) {
            console.log('Não consegui desbloquear o contato');
        }
    }
    if (!active) {
        try {
            //const whatsappCompany = await GetDefaultWhatsApp(Number(companyId))
            const whatsappCompany = null;
            const wbot = (0, wbot_1.getWbot)(whatsappCompany.id);
            const jid = createJid(contact.number);
            await wbot.updateBlockStatus(jid, "block");
            await contact.update({ active: false });
        }
        catch (error) {
            console.log('Não consegui bloquear o contato');
        }
    }
    return contact;
};
exports.default = BlockUnblockContactService;
