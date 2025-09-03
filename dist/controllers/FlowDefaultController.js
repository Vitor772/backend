"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlows = exports.updateFlow = exports.createFlowDefault = void 0;
const CreateFlowDefaultService_1 = __importDefault(require("../services/FlowDefaultService/CreateFlowDefaultService"));
const UpdateFlowDefaultService_1 = __importDefault(require("../services/FlowDefaultService/UpdateFlowDefaultService"));
const FlowsDefaultGetDataService_1 = __importDefault(require("../services/FlowDefaultService/FlowsDefaultGetDataService"));
// import { handleMessage } from "../services/FacebookServices/facebookMessageListener";
const createFlowDefault = async (req, res) => {
    const { flowIdWelcome, flowIdPhrase } = req.body;
    const userId = parseInt(req.user.id);
    const { companyId } = req.user;
    const flow = await (0, CreateFlowDefaultService_1.default)({
        userId,
        companyId,
        flowIdWelcome,
        flowIdPhrase
    });
    return res.status(200).json(flow);
};
exports.createFlowDefault = createFlowDefault;
const updateFlow = async (req, res) => {
    const { companyId } = req.user;
    const { flowIdWelcome, flowIdPhrase } = req.body;
    const flow = await (0, UpdateFlowDefaultService_1.default)({ companyId, flowIdWelcome, flowIdPhrase });
    return res.status(200).json(flow);
};
exports.updateFlow = updateFlow;
const getFlows = async (req, res) => {
    const { companyId } = req.user;
    const flows = await (0, FlowsDefaultGetDataService_1.default)({
        companyId
    });
    return res.status(200).json(flows);
};
exports.getFlows = getFlows;
