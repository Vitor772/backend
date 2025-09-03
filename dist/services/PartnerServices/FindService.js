"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Partner_1 = __importDefault(require("../../models/Partner"));
const FindService = async () => {
    const notes = await Partner_1.default.findAll({
        order: [["name", "ASC"]]
    });
    return notes;
};
exports.default = FindService;
