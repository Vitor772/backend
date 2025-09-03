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
exports.remove = exports.update = exports.show = exports.store = exports.list = exports.index = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = __importDefault(require("../config/auth"));
const Yup = __importStar(require("yup"));
// import { getIO } from "../libs/socket";
const AppError_1 = __importDefault(require("../errors/AppError"));
const Plan_1 = __importDefault(require("../models/Plan"));
const ListPlansService_1 = __importDefault(require("../services/PlanService/ListPlansService"));
const CreatePlanService_1 = __importDefault(require("../services/PlanService/CreatePlanService"));
const UpdatePlanService_1 = __importDefault(require("../services/PlanService/UpdatePlanService"));
const ShowPlanService_1 = __importDefault(require("../services/PlanService/ShowPlanService"));
const FindAllPlanService_1 = __importDefault(require("../services/PlanService/FindAllPlanService"));
const DeletePlanService_1 = __importDefault(require("../services/PlanService/DeletePlanService"));
const User_1 = __importDefault(require("../models/User"));
const Company_1 = __importDefault(require("../models/Company"));
const index = async (req, res) => {
    const { searchParam, pageNumber, listPublic } = req.query;
    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");
    const decoded = (0, jsonwebtoken_1.verify)(token, auth_1.default.secret);
    const { id: requestUserId, profile, companyId } = decoded;
    const requestUser = await User_1.default.findByPk(requestUserId);
    const company = await Company_1.default.findByPk(companyId);
    const PlanCompany = company.planId;
    const plans = await Plan_1.default.findByPk(PlanCompany);
    const plansName = plans.name;
    if (requestUser.super === true) {
        const { plans, count, hasMore } = await (0, ListPlansService_1.default)({
            searchParam,
            pageNumber
        });
        return res.json({ plans, count, hasMore });
    }
    else {
        const { plans, count, hasMore } = await (0, ListPlansService_1.default)({
            searchParam: plansName,
            pageNumber,
            listPublic
        });
        return res.json({ plans, count, hasMore });
    }
};
exports.index = index;
const list = async (req, res) => {
    const { listPublic } = req.query;
    const plans = await (0, FindAllPlanService_1.default)(listPublic);
    return res.status(200).json(plans);
};
exports.list = list;
const store = async (req, res) => {
    const newPlan = req.body;
    const schema = Yup.object().shape({
        name: Yup.string().required()
    });
    try {
        await schema.validate(newPlan);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const plan = await (0, CreatePlanService_1.default)(newPlan);
    // const io = getIO();
    // io.of(companyId.toString())
    // .emit("plan", {
    //   action: "create",
    //   plan
    // });
    return res.status(200).json(plan);
};
exports.store = store;
const show = async (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");
    const decoded = (0, jsonwebtoken_1.verify)(token, auth_1.default.secret);
    const { id: requestUserId, profile, companyId } = decoded;
    const requestUser = await User_1.default.findByPk(requestUserId);
    const company = await Company_1.default.findByPk(companyId);
    const PlanCompany = company.planId;
    if (requestUser.super === true) {
        const plan = await (0, ShowPlanService_1.default)(id);
        return res.status(200).json(plan);
    }
    else if (id !== PlanCompany.toString()) {
        return res.status(400).json({ error: "Você não possui permissão para acessar este recurso!" });
    }
    else if (id === PlanCompany.toString()) {
        const plan = await (0, ShowPlanService_1.default)(id);
        return res.status(200).json(plan);
    }
};
exports.show = show;
const update = async (req, res) => {
    const planData = req.body;
    const schema = Yup.object().shape({
        name: Yup.string()
    });
    try {
        await schema.validate(planData);
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const { id,
    //   name,
    //   users,
    //   connections,
    //   queues,
    //   amount,
    //   useWhatsapp,
    //   useFacebook,
    //   useInstagram,
    //   useCampaigns,
    //   useSchedules,
    //   useInternalChat,
    //   useExternalApi,
    //   useKanban,
    //   useOpenAi,
    //   useIntegrations
     } = planData;
    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");
    const decoded = (0, jsonwebtoken_1.verify)(token, auth_1.default.secret);
    const { id: requestUserId, profile, companyId } = decoded;
    const requestUser = await User_1.default.findByPk(requestUserId);
    const company = await Company_1.default.findByPk(companyId);
    const PlanCompany = company.planId;
    if (requestUser.super === true) {
        const plan = await (0, UpdatePlanService_1.default)(planData
        // id,
        // name,
        // users,
        // connections,
        // queues,
        // amount,
        // useWhatsapp,
        // useFacebook,
        // useInstagram,
        // useCampaigns,
        // useSchedules,
        // useInternalChat,
        // useExternalApi,
        // useKanban,
        // useOpenAi,
        // useIntegrations
        );
        return res.status(200).json(plan);
    }
    else if (PlanCompany.toString() !== id) {
        return res.status(400).json({ error: "Você não possui permissão para acessar este recurso!" });
    }
    // const io = getIO();
    // io.of(companyId.toString())
    // .emit("plan", {
    //   action: "update",
    //   plan
    // });
};
exports.update = update;
const remove = async (req, res) => {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const [, token] = authHeader.split(" ");
    const decoded = (0, jsonwebtoken_1.verify)(token, auth_1.default.secret);
    const { id: requestUserId, profile, companyId } = decoded;
    const requestUser = await User_1.default.findByPk(requestUserId);
    if (requestUser.super === true) {
        const plan = await (0, DeletePlanService_1.default)(id);
        return res.status(200).json(plan);
    }
    else if (companyId.toString() !== id) {
        return res.status(400).json({ error: "Você não possui permissão para acessar este recurso!" });
    }
};
exports.remove = remove;
