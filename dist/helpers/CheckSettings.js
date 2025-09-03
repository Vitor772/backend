"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckCompanySetting = exports.CheckSettings1 = void 0;
const Setting_1 = __importDefault(require("../models/Setting"));
const AppError_1 = __importDefault(require("../errors/AppError"));
//será usado por agora somente para userCreation
const CheckSettings = async (key) => {
    const setting = await Setting_1.default.findOne({
        where: { key }
    });
    if (!setting) {
        throw new AppError_1.default("ERR_NO_SETTING_FOUND", 404);
    }
    return setting.value;
};
const CheckSettings1 = async (key, defaultValue = null) => {
    const setting = await Setting_1.default.findOne({
        where: {
            companyId: 1,
            key
        }
    });
    if (!setting) {
        if (!defaultValue)
            throw new AppError_1.default("ERR_NO_SETTING_FOUND", 404);
        return defaultValue;
    }
    return setting.value;
};
exports.CheckSettings1 = CheckSettings1;
const CheckCompanySetting = async (companyId, key, defaultValue = null) => {
    const setting = await Setting_1.default.findOne({
        where: {
            companyId,
            key
        }
    });
    if (!setting && !defaultValue) {
        throw new AppError_1.default("ERR_NO_SETTING_FOUND", 404);
    }
    return setting?.value || defaultValue;
};
exports.CheckCompanySetting = CheckCompanySetting;
exports.default = CheckSettings;
