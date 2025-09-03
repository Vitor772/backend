"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const DispatchWebHookService = async ({ userId, hashId, data }) => {
    try {
        const webhook = await Webhook_1.WebhookModel.findOne({
            where: {
                user_id: userId,
                hash_id: hashId,
            }
        });
        const config = {
            lastRequest: {
                ...data
            },
        };
        const webhookUpdate = await Webhook_1.WebhookModel.update({ config }, {
            where: { hash_id: hashId, user_id: userId }
        });
        return webhook;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = DispatchWebHookService;
