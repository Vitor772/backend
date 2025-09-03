"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Invoices_1 = __importDefault(require("../../models/Invoices"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const DeleteInvoiceService = async (id) => {
    const invoice = await Invoices_1.default.findOne({
        where: { id }
    });
    if (!invoice) {
        throw new AppError_1.default("ERR_NO_INVOICE_FOUND", 404);
    }
    await invoice.destroy();
};
exports.default = DeleteInvoiceService;
