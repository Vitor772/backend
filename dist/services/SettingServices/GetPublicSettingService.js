"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Setting_1 = __importDefault(require("../../models/Setting"));
const publicSettingsKeys = [
    "allowSignup",
    "primaryColorLight",
    "primaryColorDark",
    "appLogoLight",
    "appLogoDark",
    "appLogoFavicon",
    "appName"
];
const GetPublicSettingService = async ({ key }) => {
    console.log("|======== GetPublicSettingService ========|");
    console.log("key", key);
    console.log("|=========================================|");
    if (!publicSettingsKeys.includes(key)) {
        return null;
    }
    const setting = await Setting_1.default.findOne({
        where: {
            companyId: 1,
            key
        }
    });
    return setting?.value;
};
exports.default = GetPublicSettingService;
