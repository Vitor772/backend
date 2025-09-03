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
const express_1 = __importDefault(require("express"));
const isAuth_1 = __importDefault(require("../middleware/isAuth"));
const multer_1 = __importDefault(require("multer"));
const uploadExt_1 = __importDefault(require("../config/uploadExt"));
const FlowBuilderController = __importStar(require("../controllers/FlowBuilderController"));
const upload = (0, multer_1.default)(uploadExt_1.default);
const flowBuilder = express_1.default.Router();
flowBuilder.post("/flowbuilder", isAuth_1.default, FlowBuilderController.createFlow);
flowBuilder.put("/flowbuilder", isAuth_1.default, FlowBuilderController.updateFlow);
flowBuilder.delete("/flowbuilder/:idFlow", isAuth_1.default, FlowBuilderController.deleteFlow);
flowBuilder.get("/flowbuilder", isAuth_1.default, FlowBuilderController.myFlows);
flowBuilder.get("/flowbuilder/:idFlow", isAuth_1.default, FlowBuilderController.flowOne);
flowBuilder.post("/flowbuilder/flow", isAuth_1.default, FlowBuilderController.FlowDataUpdate);
flowBuilder.post("/flowbuilder/duplicate", isAuth_1.default, FlowBuilderController.FlowDuplicate);
flowBuilder.get("/flowbuilder/flow/:idFlow", isAuth_1.default, FlowBuilderController.FlowDataGetOne);
flowBuilder.post("/flowbuilder/img", isAuth_1.default, upload.array("medias"), FlowBuilderController.FlowUploadImg);
flowBuilder.post("/flowbuilder/audio", isAuth_1.default, upload.array("medias"), FlowBuilderController.FlowUploadAudio);
flowBuilder.post("/flowbuilder/content", isAuth_1.default, upload.array('medias'), FlowBuilderController.FlowUploadAll);
exports.default = flowBuilder;
