"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const ContactWallet_1 = __importDefault(require("../../models/ContactWallet"));
const CreateContactService = async ({ name, number, email = "", acceptAudioMessage, active, companyId, extraInfo = [], remoteJid = "", wallets }) => {
    const numberExists = await Contact_1.default.findOne({
        where: { number, companyId }
    });
    if (numberExists) {
        throw new AppError_1.default("ERR_DUPLICATED_CONTACT");
    }
    const settings = await CompaniesSettings_1.default.findOne({
        where: {
            companyId
        }
    });
    const { acceptAudioMessageContact } = settings;
    const contact = await Contact_1.default.create({
        name,
        number,
        email,
        acceptAudioMessage: acceptAudioMessageContact === 'enabled' ? true : false,
        active,
        extraInfo,
        companyId,
        remoteJid
    }, {
        include: ["extraInfo",
            {
                association: "wallets",
                attributes: ["id", "name"]
            }]
    });
    if (wallets) {
        await ContactWallet_1.default.destroy({
            where: {
                companyId,
                contactId: contact.id
            }
        });
        const contactWallets = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wallets.forEach((wallet) => {
            contactWallets.push({
                walletId: !wallet.id ? wallet : wallet.id,
                contactId: contact.id,
                companyId
            });
        });
        await ContactWallet_1.default.bulkCreate(contactWallets);
    }
    return contact;
};
exports.default = CreateContactService;
