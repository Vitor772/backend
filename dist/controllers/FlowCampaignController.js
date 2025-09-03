"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFlowCampaign = exports.updateFlowCampaign = exports.flowCampaign = exports.flowCampaigns = exports.createFlowCampaign = void 0;
const CreateFlowCampaignService_1 = __importDefault(require("../services/FlowCampaignService/CreateFlowCampaignService"));
const FlowsCampaignGetDataService_1 = __importDefault(require("../services/FlowCampaignService/FlowsCampaignGetDataService"));
const GetFlowsCampaignDataService_1 = __importDefault(require("../services/FlowCampaignService/GetFlowsCampaignDataService"));
const DeleteFlowCampaignService_1 = __importDefault(require("../services/FlowCampaignService/DeleteFlowCampaignService"));
const UpdateFlowCampaignService_1 = __importDefault(require("../services/FlowCampaignService/UpdateFlowCampaignService"));
// import { handleMessage } from "../services/FacebookServices/facebookMessageListener";
const createFlowCampaign = async (req, res) => {
    const { name, flowId, phrase, whatsappId } = req.body;
    const userId = parseInt(req.user.id);
    const { companyId } = req.user;
    const flow = await (0, CreateFlowCampaignService_1.default)({
        userId,
        name,
        companyId,
        flowId,
        whatsappId,
        phrase
    });
    return res.status(200).json(flow);
};
exports.createFlowCampaign = createFlowCampaign;
const flowCampaigns = async (req, res) => {
    const userId = parseInt(req.user.id);
    const { companyId } = req.user;
    const flow = await (0, FlowsCampaignGetDataService_1.default)({
        companyId,
    });
    return res.status(200).json(flow);
};
exports.flowCampaigns = flowCampaigns;
const flowCampaign = async (req, res) => {
    const userId = parseInt(req.user.id);
    const { idFlow } = req.params;
    const { companyId } = req.user;
    const id = parseInt(idFlow);
    const flow = await (0, GetFlowsCampaignDataService_1.default)({
        companyId,
        idFlow: id
    });
    return res.status(200).json(flow);
};
exports.flowCampaign = flowCampaign;
const updateFlowCampaign = async (req, res) => {
    const { companyId } = req.user;
    const { flowId, name, phrase, id, status } = req.body;
    const flow = await (0, UpdateFlowCampaignService_1.default)({ companyId, name, flowId, phrase, id, status });
    return res.status(200).json(flow);
};
exports.updateFlowCampaign = updateFlowCampaign;
const deleteFlowCampaign = async (req, res) => {
    const { idFlow } = req.params;
    const flowIdInt = parseInt(idFlow);
    const flow = await (0, DeleteFlowCampaignService_1.default)(flowIdInt);
    return res.status(200).json(flow);
};
exports.deleteFlowCampaign = deleteFlowCampaign;
