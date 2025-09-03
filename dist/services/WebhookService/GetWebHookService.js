"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const GetWebHookService = async ({ companyId, hashId }) => {
    try {
        // Realiza a consulta com paginação usando findAndCountAll
        const { count, rows } = await Webhook_1.WebhookModel.findAndCountAll({
            where: {
                company_id: companyId,
                hash_id: hashId
            }
        });
        let hook = rows[0];
        return {
            webhook: hook
        };
    }
    catch (error) {
        console.error('Erro ao consultar usuários:', error);
    }
};
exports.default = GetWebHookService;
