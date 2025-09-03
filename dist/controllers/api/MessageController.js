"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.show = void 0;
const GetMessageRangeService_1 = __importDefault(require("../../services/MessageServices/GetMessageRangeService"));
const show = async (req, res) => {
    const { companyId, startDate, lastDate } = req.body;
    const messages = await (0, GetMessageRangeService_1.default)({ companyId, startDate, lastDate });
    return res.status(200).json(messages);
};
exports.show = show;
