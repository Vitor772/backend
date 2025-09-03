"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wbot_1 = require("../libs/wbot");
const wbotMessageListener_1 = require("../services/WbotServices/wbotMessageListener");
exports.default = {
    key: `${process.env.DB_NAME}-handleMessage`,
    async handle({ data }) {
        try {
            const { message, wbot, companyId } = data;
            if (message === undefined || wbot === undefined || companyId === undefined) {
                console.log("message, wbot, companyId", message, wbot, companyId);
            }
            const w = (0, wbot_1.getWbot)(wbot);
            if (!w) {
                console.log("wbot not found", wbot);
            }
            try {
                await (0, wbotMessageListener_1.handleMessage)(message, w, companyId);
            }
            catch (error) {
                console.log(error);
            }
        }
        catch (error) {
            console.log("error", error);
        }
    },
};
