"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("../../libs/socket");
const Contact_1 = __importDefault(require("../../models/Contact"));
const CreateOrUpdateContactServiceForImport = async ({ name, number: rawNumber, profilePicUrl, isGroup, email = "", commandBot = "", extraInfo = [], companyId }) => {
    const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");
    const io = (0, socket_1.getIO)();
    let contact;
    contact = await Contact_1.default.findOne({ where: { number, companyId } });
    if (contact) {
        if (contact.companyId === null)
            await contact.update({ name, profilePicUrl, companyId });
        else
            await contact.update({ name, profilePicUrl });
        io.of(String(companyId))
            .emit(`company-${companyId}-contact`, {
            action: "update",
            contact
        });
    }
    else {
        contact = await Contact_1.default.create({
            name,
            companyId,
            number,
            profilePicUrl,
            email,
            commandBot,
            isGroup,
            extraInfo
        });
        io.of(String(companyId))
            .emit(`company-${companyId}-contact`, {
            action: "create",
            contact
        });
    }
    return contact;
};
exports.default = CreateOrUpdateContactServiceForImport;
