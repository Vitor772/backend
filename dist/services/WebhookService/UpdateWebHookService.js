"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const UpdateWebHookService = async ({ userId, name, companyId, webhookId }) => {
    try {
        const nameExist = await Webhook_1.WebhookModel.findOne({
            where: {
                name,
                company_id: companyId
            }
        });
        if (nameExist) {
            return 'exist';
        }
        const webhook = await Webhook_1.WebhookModel.update({ name }, {
            where: { id: webhookId, user_id: userId }
        });
        return 'ok';
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = UpdateWebHookService;
