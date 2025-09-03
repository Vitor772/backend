"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const FlowBuilder_1 = require("../../models/FlowBuilder");
const ActionsWebhookService_1 = require("./ActionsWebhookService");
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const DispatchWebHookService = async ({ companyId, hashId, data, req }) => {
    try {
        const webhook = await Webhook_1.WebhookModel.findOne({
            where: {
                company_id: companyId,
                hash_id: hashId
            }
        });
        const config = {
            ...webhook.config,
            lastRequest: {
                ...data
            }
        };
        const requestAll = webhook.requestAll + 1;
        const webhookUpdate = await Webhook_1.WebhookModel.update({ config, requestAll }, {
            where: { hash_id: hashId, company_id: companyId }
        });
        if (webhook.config["details"]) {
            const flow = await FlowBuilder_1.FlowBuilderModel.findOne({
                where: {
                    id: webhook.config["details"].idFlow
                }
            });
            const nodes = flow.flow["nodes"];
            const connections = flow.flow["connections"];
            const nextStage = connections[0].source;
            const { count, rows } = await Whatsapp_1.default.findAndCountAll({
                where: {
                    companyId: companyId
                }
            });
            const whatsappIds = [];
            rows.forEach(usuario => {
                whatsappIds.push(usuario.toJSON());
            });
            (0, ActionsWebhookService_1.ActionsWebhookService)(0, webhook.config["details"].idFlow, companyId, nodes, connections, nextStage, data, webhook.config["details"], hashId);
        }
        return webhook;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = DispatchWebHookService;
