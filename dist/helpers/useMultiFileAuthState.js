"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMultiFileAuthState = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const baileys_2 = require("@whiskeysockets/baileys");
const baileys_3 = require("@whiskeysockets/baileys");
const cache_1 = __importDefault(require("../libs/cache"));
const useMultiFileAuthState = async (whatsapp) => {
    const writeData = async (data, file) => {
        try {
            await cache_1.default.set(`sessions:${whatsapp.id}:${file}`, JSON.stringify(data, baileys_3.BufferJSON.replacer));
        }
        catch (error) {
            console.log("writeData error", error);
            return null;
        }
    };
    const readData = async (file) => {
        try {
            const data = await cache_1.default.get(`sessions:${whatsapp.id}:${file}`);
            return JSON.parse(data, baileys_3.BufferJSON.reviver);
        }
        catch (error) {
            return null;
        }
    };
    const removeData = async (file) => {
        try {
            await cache_1.default.del(`sessions:${whatsapp.id}:${file}`);
        }
        catch { }
    };
    const creds = (await readData("creds")) || (0, baileys_2.initAuthCreds)();
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}`);
                        if (type === "app-state-sync-key" && value) {
                            value = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const file = `${category}-${id}`;
                            tasks.push(value ? writeData(value, file) : removeData(file));
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => {
            return writeData(creds, "creds");
        }
    };
};
exports.useMultiFileAuthState = useMultiFileAuthState;
