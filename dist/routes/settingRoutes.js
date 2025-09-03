"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const envTokenAuth_1 = __importDefault(require("../middleware/envTokenAuth"));
const multer_1 = __importDefault(require("multer"));
const SettingController = __importStar(require("../controllers/SettingController"));
const upload_1 = __importDefault(require("../config/upload"));
const privateFiles_1 = __importDefault(require("../config/privateFiles"));
const uploadcertificado_1 = __importDefault(require("../config/uploadcertificado"));
const upload = (0, multer_1.default)(upload_1.default);
const uploadPrivate = (0, multer_1.default)(privateFiles_1.default);
const uploadCert = (0, multer_1.default)(uploadcertificado_1.default);
const settingRoutes = (0, express_1.Router)();
settingRoutes.get("/settings", isAuth_1.default, SettingController.index);
settingRoutes.get("/settings/:settingKey", isAuth_1.default, SettingController.showOne);
// change setting key to key in future
settingRoutes.put("/settings/:settingKey", isAuth_1.default, SettingController.update);
settingRoutes.get("/setting/:settingKey", isAuth_1.default, SettingController.getSetting);
settingRoutes.put("/setting/:settingKey", isAuth_1.default, SettingController.updateOne);
settingRoutes.get("/public-settings/:settingKey", envTokenAuth_1.default, SettingController.publicShow);
settingRoutes.post("/settings-whitelabel/logo", isAuth_1.default, upload.single("file"), SettingController.storeLogo);
settingRoutes.post("/settings/cert-upload", isAuth_1.default, uploadCert.array("file"), SettingController.certUpload);
settingRoutes.post("/settings/privateFile", isAuth_1.default, uploadPrivate.single("file"), SettingController.storePrivateFile);
exports.default = settingRoutes;
