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
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const Yup = __importStar(require("yup"));
const ListService_1 = __importDefault(require("../../services/PartnerServices/ListService"));
const CreateService_1 = __importDefault(require("../../services/PartnerServices/CreateService"));
const ShowService_1 = __importDefault(require("../../services/PartnerServices/ShowService"));
const UpdateService_1 = __importDefault(require("../../services/PartnerServices/UpdateService"));
const DeleteService_1 = __importDefault(require("../../services/PartnerServices/DeleteService"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const index = async (req, res) => {
    const { searchParam, pageNumber } = req.query;
    const { records, count, hasMore } = await (0, ListService_1.default)({
        searchParam,
        pageNumber
    });
    return res.json({ records, count, hasMore });
};
exports.index = index;
const store = async (req, res) => {
    const data = req.body;
    const schema = Yup.object().shape({
        name: Yup.string().required(),
        phone: Yup.string().required(),
        email: Yup.string().required(),
        document: Yup.string().required(),
        commission: Yup.number().required(),
        typeCommission: Yup.string().required(),
    });
    try {
        await schema.validate(data);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const record = await (0, CreateService_1.default)({
        ...data
    });
    return res.status(200).json(record);
};
exports.store = store;
const show = async (req, res) => {
    const { id } = req.params;
    const record = await (0, ShowService_1.default)(id);
    return res.status(200).json(record);
};
exports.show = show;
const update = async (req, res) => {
    const data = req.body;
    const schema = Yup.object().shape({
        name: Yup.string().required(),
        phone: Yup.string().required(),
        email: Yup.string().required(),
        document: Yup.string().required(),
        commission: Yup.number().required(),
        typeCommission: Yup.string().required(),
    });
    try {
        await schema.validate(data);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const { id } = req.params;
    const record = await (0, UpdateService_1.default)({
        ...data,
        id
    });
    return res.status(200).json(record);
};
exports.update = update;
const remove = async (req, res) => {
    const { id } = req.params;
    const Partner = await (0, DeleteService_1.default)(id);
    return res.status(200).json(Partner);
};
exports.remove = remove;
