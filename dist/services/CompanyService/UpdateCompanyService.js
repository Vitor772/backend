"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Company_1 = __importDefault(require("../../models/Company"));
const Setting_1 = __importDefault(require("../../models/Setting"));
const User_1 = __importDefault(require("../../models/User"));
const Invoices_1 = __importDefault(require("../../models/Invoices"));
const Plan_1 = __importDefault(require("../../models/Plan"));
const UpdateCompanyService = async (companyData) => {
    const company = await Company_1.default.findByPk(companyData.id);
    const { name, phone, email, status, planId, campaignsEnabled, dueDate, recurrence, document, paymentMethod, password } = companyData;
    if (!company) {
        throw new AppError_1.default("ERR_NO_COMPANY_FOUND", 404);
    }
    const openInvoices = await Invoices_1.default.findAll({
        where: {
            status: "open",
            companyId: company.id,
        },
    });
    if (openInvoices.length > 1) {
        for (const invoice of openInvoices.slice(1)) {
            await invoice.update({ status: "cancelled" });
        }
    }
    const plan = await Plan_1.default.findByPk(planId);
    if (!plan) {
        throw new Error("Plano Não Encontrado.");
    }
    // 5. Atualizar a única invoice com status "open" existente, baseada no companyId.
    const openInvoice = openInvoices[0];
    const valuePlan = plan.amount.replace(",", ".");
    if (openInvoice) {
        await openInvoice.update({
            value: valuePlan,
            detail: plan.name,
            users: plan.users,
            connections: plan.connections,
            queues: plan.queues,
            dueDate: dueDate,
        });
    }
    else {
        throw new Error("Nenhuma fatura em aberto para este cliente!");
    }
    const existUser = await User_1.default.findOne({
        where: {
            companyId: company.id,
            email: email
        }
    });
    if (existUser && existUser.email !== company.email) {
        throw new AppError_1.default("Usuário já existe com esse e-mail!", 404);
    }
    const user = await User_1.default.findOne({
        where: {
            companyId: company.id,
            email: company.email
        }
    });
    if (!user) {
        throw new AppError_1.default("ERR_NO_USER_FOUND", 404);
    }
    await user.update({ email, password });
    await company.update({
        name,
        phone,
        email,
        status,
        planId,
        dueDate,
        recurrence,
        document,
        paymentMethod
    });
    if (companyData.campaignsEnabled !== undefined) {
        const [setting, created] = await Setting_1.default.findOrCreate({
            where: {
                companyId: company.id,
                key: "campaignsEnabled"
            },
            defaults: {
                companyId: company.id,
                key: "campaignsEnabled",
                value: `${campaignsEnabled}`
            }
        });
        if (!created) {
            await setting.update({ value: `${campaignsEnabled}` });
        }
    }
    return company;
};
exports.default = UpdateCompanyService;
