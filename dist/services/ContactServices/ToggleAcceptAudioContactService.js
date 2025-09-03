"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Contact_1 = __importDefault(require("../../models/Contact"));
const ToggleUseQueuesContactService = async ({ contactId }) => {
    const contact = await Contact_1.default.findOne({
        where: { id: contactId },
        attributes: ["id", "acceptAudioMessage"]
    });
    if (!contact) {
        throw new AppError_1.default("ERR_NO_CONTACT_FOUND", 404);
    }
    const acceptAudioMessage = contact?.acceptAudioMessage ? false : true;
    await contact.update({
        acceptAudioMessage
    });
    await contact.reload({
        attributes: [
            "id",
            "name",
            "number",
            "email",
            "profilePicUrl",
            "companyId",
            "acceptAudioMessage",
            "urlPicture"
        ],
        include: ["extraInfo",
            {
                association: "wallets",
                attributes: ["id", "name"]
            }]
    });
    return contact;
};
exports.default = ToggleUseQueuesContactService;
