"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @TercioSantos-0 |
 * model/CompaniesSettings |
 * @descrição:modelo para tratar as configurações das empresas
 */
const sequelize_typescript_1 = require("sequelize-typescript");
const Company_1 = __importDefault(require("./Company"));
let CompaniesSettings = class CompaniesSettings extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], CompaniesSettings.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], CompaniesSettings.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], CompaniesSettings.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "hoursCloseTicketsAuto", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "chatBotType", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "acceptCallWhatsapp", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "userRandom", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "sendGreetingMessageOneQueues", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "sendSignMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "sendFarewellWaitingTicket", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "userRating", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "sendGreetingAccepted", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "CheckMsgIsGroup", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "sendQueuePosition", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "scheduleType", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "acceptAudioMessageContact", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "sendMsgTransfTicket", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "enableLGPD", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "requiredTag", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "lgpdDeleteMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "lgpdHideNumber", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "lgpdConsent", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "lgpdLink", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "lgpdMessage", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], CompaniesSettings.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], CompaniesSettings.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], CompaniesSettings.prototype, "DirectTicketsToWallets", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], CompaniesSettings.prototype, "closeTicketOnTransfer", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "transferMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "greetingAcceptedMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "AcceptCallWhatsappMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], CompaniesSettings.prototype, "sendQueuePositionMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], CompaniesSettings.prototype, "showNotificationPending", void 0);
CompaniesSettings = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: "CompaniesSettings" })
], CompaniesSettings);
exports.default = CompaniesSettings;
