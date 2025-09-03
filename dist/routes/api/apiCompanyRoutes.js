"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CompanyController = __importStar(require("../../controllers/api/CompanyController"));
const PlanController = __importStar(require("../../controllers/api/PlanController"));
const HelpController = __importStar(require("../../controllers/api/HelpController"));
const PartnerController = __importStar(require("../../controllers/api/PartnerController"));
const InvoicesController = __importStar(require("../../controllers/InvoicesController"));
const UserController = __importStar(require("../../controllers/UserController"));
const isAuthCompany_1 = __importDefault(require("../../middleware/isAuthCompany"));
const apiCompanyRoutes = express_1.default.Router();
// PLANS
apiCompanyRoutes.get("/plans", isAuthCompany_1.default, PlanController.index);
apiCompanyRoutes.get("/plans/:id", isAuthCompany_1.default, PlanController.show);
apiCompanyRoutes.post("/plans", isAuthCompany_1.default, PlanController.store);
apiCompanyRoutes.put("/plans/:id", isAuthCompany_1.default, PlanController.update);
apiCompanyRoutes.delete("/plans/:id", isAuthCompany_1.default, PlanController.remove);
// COMPANY
apiCompanyRoutes.get("/companies", isAuthCompany_1.default, CompanyController.index);
apiCompanyRoutes.get("/companies/:id", isAuthCompany_1.default, CompanyController.show);
apiCompanyRoutes.get("/companiesEmail/:email", isAuthCompany_1.default, CompanyController.showEmail);
apiCompanyRoutes.post("/companies", isAuthCompany_1.default, CompanyController.store);
apiCompanyRoutes.put("/companies/:id", isAuthCompany_1.default, CompanyController.update);
apiCompanyRoutes.put("/companies/:id/schedules", isAuthCompany_1.default, CompanyController.updateSchedules);
apiCompanyRoutes.delete("/companies/:id", isAuthCompany_1.default, CompanyController.remove);
// HELP
apiCompanyRoutes.get("/helps", isAuthCompany_1.default, HelpController.index);
apiCompanyRoutes.get("/helps/:id", isAuthCompany_1.default, HelpController.show);
apiCompanyRoutes.post("/helps", isAuthCompany_1.default, HelpController.store);
apiCompanyRoutes.put("/helps/:id", isAuthCompany_1.default, HelpController.update);
apiCompanyRoutes.delete("/helps/:id", isAuthCompany_1.default, HelpController.remove);
+apiCompanyRoutes.get("/partners", isAuthCompany_1.default, PartnerController.index);
apiCompanyRoutes.get("/partners/:id", isAuthCompany_1.default, PartnerController.show);
apiCompanyRoutes.post("/partners", isAuthCompany_1.default, PartnerController.store);
apiCompanyRoutes.put("/partners/:id", isAuthCompany_1.default, PartnerController.update);
apiCompanyRoutes.delete("/partners/:id", isAuthCompany_1.default, PartnerController.remove);
// INVOICES
apiCompanyRoutes.get("/invoices", isAuthCompany_1.default, InvoicesController.index);
apiCompanyRoutes.get("/invoices/:id", isAuthCompany_1.default, InvoicesController.show);
apiCompanyRoutes.get("/invoicesCompany/:companyId", isAuthCompany_1.default, InvoicesController.list);
apiCompanyRoutes.post("/invoices", isAuthCompany_1.default, InvoicesController.store);
apiCompanyRoutes.put("/invoices/:id", isAuthCompany_1.default, InvoicesController.update);
apiCompanyRoutes.delete("/invoices/:id", isAuthCompany_1.default, InvoicesController.remove);
// COMPANY
// apiCompanyRoutes.get("/users", isAuthCompany, UserController.index);
// apiCompanyRoutes.get("/users/:userId", isAuthCompany, UserController.show);
apiCompanyRoutes.get("/users/:email", isAuthCompany_1.default, UserController.showEmail);
// apiCompanyRoutes.post("/users", isAuthCompany, UserController.store);
// apiCompanyRoutes.put("/users/:userId", isAuthCompany, UserController.update);
// apiCompanyRoutes.delete("/users/:userId", isAuthCompany, UserController.remove);
exports.default = apiCompanyRoutes;
