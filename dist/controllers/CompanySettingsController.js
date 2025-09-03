"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.showOnePayment = exports.showOne = exports.show = void 0;
const FindCompanySettingsService_1 = __importDefault(require("../services/CompaniesSettings/FindCompanySettingsService"));
const UpdateCompanySettingService_1 = __importDefault(require("../services/CompaniesSettings/UpdateCompanySettingService"));
const FindCompanySettingOneService_1 = __importDefault(require("../services/CompaniesSettings/FindCompanySettingOneService"));
const show = async (req, res) => {
    const { companyId } = req.user;
    const settings = await (0, FindCompanySettingsService_1.default)({
        companyId
    });
    return res.status(200).json(settings);
};
exports.show = show;
const showOne = async (req, res) => {
    const { column } = req.query;
    const { companyId } = req.user;
    const setting = await (0, FindCompanySettingOneService_1.default)({
        companyId,
        column
    });
    return res.status(200).json(setting[0]);
};
exports.showOne = showOne;
const showOnePayment = async (req, res) => {
    const { column } = req.query;
    const companyId = 1;
    const setting = await (0, FindCompanySettingOneService_1.default)({
        companyId,
        column
    });
    return res.status(200).json(setting[0]);
};
exports.showOnePayment = showOnePayment;
const update = async (req, res) => {
    const { column, data } = req.body;
    const { companyId } = req.user;
    const result = await (0, UpdateCompanySettingService_1.default)({
        companyId,
        column,
        data
    });
    return res.status(200).json({ response: true, result: result });
};
exports.update = update;
