"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const UpdateActiveWebHookService = async ({ status, webhookId }) => {
    try {
        const webhook = await Webhook_1.WebhookModel.update({ active: status }, {
            where: { id: webhookId }
        });
        return 'ok';
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = UpdateActiveWebHookService;
