"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Baileys_1 = __importDefault(require("../../models/Baileys"));
const createOrUpdateBaileysService = async ({ whatsappId, contacts, chats, }) => {
    try {
        const baileysExists = await Baileys_1.default.findOne({
            where: { whatsappId }
        });
        if (baileysExists) {
            const getChats = baileysExists.chats
                ? JSON.parse(baileysExists.chats)
                : [];
            const getContacts = baileysExists.contacts
                ? JSON.parse(baileysExists.contacts)
                : [];
            if (chats) {
                getChats.push(...chats);
                getChats.sort();
                const newChats = getChats.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i);
                return await baileysExists.update({
                    chats: JSON.stringify(newChats),
                });
            }
            if (contacts) {
                getContacts.push(...contacts);
                getContacts.sort();
                const newContacts = getContacts.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i);
                return await baileysExists.update({
                    contacts: JSON.stringify(newContacts),
                });
            }
        }
        const baileys = await Baileys_1.default.create({
            whatsappId,
            contacts: JSON.stringify(contacts),
            chats: JSON.stringify(chats)
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        return baileys;
    }
    catch (error) {
        console.log(error, whatsappId, contacts);
        throw new Error(error);
    }
};
exports.default = createOrUpdateBaileysService;
