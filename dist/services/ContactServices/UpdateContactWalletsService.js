"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const ContactWallet_1 = __importDefault(require("../../models/ContactWallet"));
const UpdateContactWalletsService = async ({ wallets, contactId, companyId }) => {
    await ContactWallet_1.default.destroy({
        where: {
            companyId,
            contactId
        }
    });
    const contactWallets = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wallets.forEach((wallet) => {
        contactWallets.push({
            walletId: !wallet.id ? wallet : wallet.id,
            contactId,
            companyId
        });
    });
    await ContactWallet_1.default.bulkCreate(contactWallets);
    const contact = await Contact_1.default.findOne({
        where: { id: contactId, companyId },
        attributes: ["id", "name", "number", "email", "profilePicUrl", "urlPicture", "companyId"],
        include: [
            "extraInfo",
            "tags",
            {
                association: "wallets",
                attributes: ["id", "name"]
            }
        ]
    });
    if (!contact) {
        throw new AppError_1.default("ERR_NO_CONTACT_FOUND", 404);
    }
    return contact;
};
exports.default = UpdateContactWalletsService;
