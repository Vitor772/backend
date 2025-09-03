"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Webhook_1 = require("../../models/Webhook");
const randomCode_1 = require("../../utils/randomCode");
const CreateWebHookService = async ({ userId, name, companyId }) => {
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
        const generateHash = (0, randomCode_1.randomString)(42);
        const webhook = await Webhook_1.WebhookModel.create({
            user_id: userId,
            hash_id: generateHash,
            company_id: companyId,
            name: name,
            active: true,
            config: null
        });
        return webhook;
    }
    catch (error) {
        console.error("Erro ao inserir o usuário:", error);
        return error;
    }
};
exports.default = CreateWebHookService;
