"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CampaignSetting_1 = __importDefault(require("../../models/CampaignSetting"));
const UpdateServiceCampaignSettings = async (data) => {
    const { id } = data;
    const record = await CampaignSetting_1.default.findByPk(id);
    if (!record) {
        throw new AppError_1.default("ERR_NO_CAMPAIGN_FOUND", 404);
    }
    await record.update(data);
    // await record.reload({
    //   include: [
    //     { model: ContactList },
    //     { model: Whatsapp, attributes: ["id", "name"] }
    //   ]
    // });
    return record;
};
exports.default = UpdateServiceCampaignSettings;
