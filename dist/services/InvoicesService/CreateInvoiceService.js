"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Invoices_1 = __importDefault(require("../../models/Invoices"));
const ShowInvoiceService_1 = __importDefault(require("./ShowInvoiceService"));
const CreateInvoiceService = async (invoiceData) => {
    let invoice = await Invoices_1.default.create(invoiceData);
    invoice = await (0, ShowInvoiceService_1.default)(invoice.id);
    return invoice;
};
exports.default = CreateInvoiceService;
