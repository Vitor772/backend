"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const UpdateWebHookConfigService = async ({ companyId, details, webhookId }) => {
    try {
        const webhookOld = await Webhook_1.WebhookModel.findOne({
            where: {
                company_id: companyId,
                id: webhookId
            }
        });
        const config = { ...webhookOld.config, details: details };
        const webhook = await Webhook_1.WebhookModel.update({ config }, {
            where: { id: webhookId, company_id: companyId }
        });
        return 'ok';
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = UpdateWebHookConfigService;
