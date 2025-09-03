"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @TercioSantos-0 |
 * serviço/atualizar 1 configuração da empresa |
 * @params:companyId/column(name)/data
 */
const database_1 = __importDefault(require("../../database"));
const UpdateCompanySettingsService = async ({ companyId, column, data }) => {
    const [results, metadata] = await database_1.default.query(`UPDATE "CompaniesSettings" SET "${column}"='${data}' WHERE "companyId"=${companyId}`);
    return results;
};
exports.default = UpdateCompanySettingsService;
