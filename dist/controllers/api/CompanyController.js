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
exports.remove = exports.updateSchedules = exports.update = exports.list = exports.showEmail = exports.show = exports.store = exports.index = void 0;
const Yup = __importStar(require("yup"));
const sequelize_1 = require("sequelize");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Company_1 = __importDefault(require("../../models/Company"));
const ListCompaniesService_1 = __importDefault(require("../../services/CompanyService/ListCompaniesService"));
const CreateCompanyService_1 = __importDefault(require("../../services/CompanyService/CreateCompanyService"));
const UpdateCompanyService_1 = __importDefault(require("../../services/CompanyService/UpdateCompanyService"));
const ShowCompanyService_1 = __importDefault(require("../../services/CompanyService/ShowCompanyService"));
const UpdateSchedulesService_1 = __importDefault(require("../../services/CompanyService/UpdateSchedulesService"));
const DeleteCompanyService_1 = __importDefault(require("../../services/CompanyService/DeleteCompanyService"));
const FindAllCompaniesService_1 = __importDefault(require("../../services/CompanyService/FindAllCompaniesService"));
const ShowEmailCompanyService_1 = __importDefault(require("../../services/CompanyService/ShowEmailCompanyService"));
const index = async (req, res) => {
    const { searchParam, pageNumber } = req.query;
    const { companies, count, hasMore } = await (0, ListCompaniesService_1.default)({
        searchParam,
        pageNumber
    });
    return res.json({ companies, count, hasMore });
};
exports.index = index;
const store = async (req, res) => {
    const newCompany = req.body;
    const schema = Yup.object().shape({
        name: Yup.string()
            .required()
            .min(2, "ERR_COMPANY_INVALID_NAME")
            .required("ERR_COMPANY_INVALID_NAME")
            .test("Check-unique-name", "ERR_COMPANY_NAME_ALREADY_EXISTS", async (value) => {
            if (value) {
                const companyWithSameName = await Company_1.default.findOne({
                    where: { name: value }
                });
                return !companyWithSameName;
            }
            return false;
        }),
        document: Yup.string()
            .min(11, "ERR_COMPANY_INVALID_DOCUMENT")
            .max(14, "ERR_COMPANY_INVALID_DOCUMENT")
            .required("ERR_COMPANY_INVALID_DOCUMENT")
            .test("Check-unique-document", "ERR_COMPANY_DOCUMENT_ALREADY_EXISTS", async (value) => {
            if (value) {
                const companyWithSameDocument = await Company_1.default.findOne({
                    where: { document: value }
                });
                return !companyWithSameDocument;
            }
            return false;
        }),
        phone: Yup.string(),
        email: Yup.string(),
        planId: Yup.number().required(),
        password: Yup.string().required().min(5)
    });
    try {
        await schema.validate(newCompany);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const company = await (0, CreateCompanyService_1.default)(newCompany);
    return res.status(200).json(company);
};
exports.store = store;
const show = async (req, res) => {
    const { id } = req.params;
    const company = await (0, ShowCompanyService_1.default)(id);
    return res.status(200).json(company);
};
exports.show = show;
const showEmail = async (req, res) => {
    const { email } = req.params;
    const company = await (0, ShowEmailCompanyService_1.default)(email);
    return res.status(200).json(company);
};
exports.showEmail = showEmail;
const list = async (req, res) => {
    const companies = await (0, FindAllCompaniesService_1.default)();
    return res.status(200).json(companies);
};
exports.list = list;
const update = async (req, res) => {
    const companyData = req.body;
    const { id } = req.params;
    const schema = Yup.object().shape({
        name: Yup.string()
            .required()
            .min(2, "ERR_COMPANY_INVALID_NAME")
            .required("ERR_COMPANY_INVALID_NAME")
            .test("Check-unique-name", "ERR_COMPANY_NAME_ALREADY_EXISTS", async (value) => {
            if (value) {
                const companyWithSameName = await Company_1.default.findOne({
                    where: { name: value, id: { [sequelize_1.Op.ne]: companyData.id } }
                });
                return !companyWithSameName;
            }
            return false;
        }),
        phone: Yup.string(),
        email: Yup.string(),
        document: Yup.string()
            .min(11, "ERR_COMPANY_INVALID_DOCUMENT")
            .max(14, "ERR_COMPANY_INVALID_DOCUMENT")
            .required("ERR_COMPANY_INVALID_DOCUMENT")
            .test("Check-unique-document", "ERR_COMPANY_DOCUMENT_ALREADY_EXISTS", async (value) => {
            if (value) {
                const companyWithSameDocument = await Company_1.default.findOne({
                    where: { document: value, id: { [sequelize_1.Op.ne]: companyData.id } }
                });
                return !companyWithSameDocument;
            }
            return false;
        }),
        planId: Yup.number().required()
    });
    try {
        await schema.validate(companyData);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const company = await (0, UpdateCompanyService_1.default)({ id, ...companyData });
    return res.status(200).json(company);
};
exports.update = update;
const updateSchedules = async (req, res) => {
    const { schedules } = req.body;
    const { id } = req.params;
    const company = await (0, UpdateSchedulesService_1.default)({
        id,
        schedules
    });
    return res.status(200).json(company);
};
exports.updateSchedules = updateSchedules;
const remove = async (req, res) => {
    const { id } = req.params;
    const company = await (0, DeleteCompanyService_1.default)(id);
    return res.status(200).json(company);
};
exports.remove = remove;
