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
const SubscriptionController = __importStar(require("../controllers/SubscriptionController"));
const subscriptionRoutes = express_1.default.Router();
subscriptionRoutes.post("/subscription", isAuth_1.default, SubscriptionController.createSubscription);
subscriptionRoutes.post("/subscription/create/webhook", SubscriptionController.createWebhook);
// subscriptionRoutes.delete("/subscription/create/webhook",isAuth,SubscriptionController.deleteWebhook);
// subscriptionRoutes.post("/subscription/return/:type?",SubscriptionController.webhook);
// subscriptionRoutes.post("/subscription/return/c5c0f5a4-efe2-447f-8c73-55f8c0f07284/pix",SubscriptionController.webhook);
subscriptionRoutes.post("/subscription/webhook/:type?", SubscriptionController.webhook);
subscriptionRoutes.post("/subscription/webhook/pix/:type?", SubscriptionController.webhook);
subscriptionRoutes.post("/subscription/stripewebhook/:type?", SubscriptionController.stripewebhook);
subscriptionRoutes.post("/subscription/mercadopagowebhook/:type?", SubscriptionController.mercadopagowebhook);
subscriptionRoutes.post("/subscription/asaaswebhook/:type?", SubscriptionController.asaaswebhook);
exports.default = subscriptionRoutes;
