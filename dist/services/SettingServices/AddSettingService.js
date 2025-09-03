"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Setting_1 = __importDefault(require("../../models/Setting"));
const AddSettingService = async () => {
    try {
        const newSetting = {
            key: "wtV",
            value: "disabled",
            createdAt: new Date(),
            updatedAt: new Date(),
            companyId: null
        };
        await Setting_1.default.create(newSetting);
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = AddSettingService;
