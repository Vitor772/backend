"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWbotMessage = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const GetMessagesService_1 = __importDefault(require("../services/MessageServices/GetMessagesService"));
const GetWbotMessage = async (ticket, messageId) => {
    const fetchWbotMessagesGradually = async () => {
        const msgFound = await (0, GetMessagesService_1.default)({
            id: messageId
        });
        return msgFound;
    };
    try {
        const msgFound = await fetchWbotMessagesGradually();
        if (!msgFound) {
            throw new Error("Cannot found message within 100 last messages");
        }
        return msgFound;
    }
    catch (err) {
        console.log(err);
        throw new AppError_1.default("ERR_FETCH_WAPP_MSG");
    }
};
exports.GetWbotMessage = GetWbotMessage;
exports.default = exports.GetWbotMessage;
