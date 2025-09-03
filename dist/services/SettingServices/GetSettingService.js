"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Setting_1 = __importDefault(require("../../models/Setting"));
const GetSettingService = async ({ key }) => {
    const setting = await Setting_1.default.findOne({
        where: {
            key
        }
    });
    if (setting === null) {
        return "enabled";
    }
    return setting;
};
exports.default = GetSettingService;
