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
const sequelize_typescript_1 = require("sequelize-typescript");
const Queue_1 = __importDefault(require("./Queue"));
const Ticket_1 = __importDefault(require("./Ticket"));
const WhatsappQueue_1 = __importDefault(require("./WhatsappQueue"));
const Company_1 = __importDefault(require("./Company"));
const QueueIntegrations_1 = __importDefault(require("./QueueIntegrations"));
const Prompt_1 = __importDefault(require("./Prompt"));
const FlowBuilder_1 = require("./FlowBuilder");
let Whatsapp = class Whatsapp extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "session", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "qrcode", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "battery", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Whatsapp.prototype, "plugged", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "retries", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "number", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "greetingMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "greetingMediaAttachment", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "farewellMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "complationMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "outOfHoursMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ defaultValue: "stable" }),
    __metadata("design:type", String)
], Whatsapp.prototype, "provider", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.AllowNull,
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Whatsapp.prototype, "isDefault", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.AllowNull,
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Whatsapp.prototype, "allowGroup", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Whatsapp.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Whatsapp.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Ticket_1.default),
    __metadata("design:type", Array)
], Whatsapp.prototype, "tickets", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Queue_1.default, () => WhatsappQueue_1.default),
    __metadata("design:type", Array)
], Whatsapp.prototype, "queues", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => WhatsappQueue_1.default),
    __metadata("design:type", Array)
], Whatsapp.prototype, "whatsappQueues", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], Whatsapp.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "token", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "facebookUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "facebookUserToken", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "facebookPageUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "tokenMeta", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Whatsapp.prototype, "channel", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(3),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "maxUseBotQueues", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "timeUseBotQueues", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "expiresTicket", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "timeSendQueue", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Queue_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "sendIdQueue", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Queue_1.default),
    __metadata("design:type", Queue_1.default)
], Whatsapp.prototype, "queueSend", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "timeInactiveMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "inactiveMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "ratingMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "maxUseBotQueuesNPS", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "expiresTicketNPS", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "whenExpiresTicket", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "expiresInactiveMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("disabled"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "groupAsTicket", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Whatsapp.prototype, "importOldMessages", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Whatsapp.prototype, "importRecentMessages", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "statusImportMessages", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Whatsapp.prototype, "closedTicketsPostImported", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Whatsapp.prototype, "importOldMessagesGroups", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "timeCreateNewTicket", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => QueueIntegrations_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "integrationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => QueueIntegrations_1.default),
    __metadata("design:type", QueueIntegrations_1.default)
], Whatsapp.prototype, "queueIntegrations", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB
    }),
    __metadata("design:type", Array)
], Whatsapp.prototype, "schedules", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Prompt_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "promptId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Prompt_1.default),
    __metadata("design:type", Prompt_1.default)
], Whatsapp.prototype, "prompt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "collectiveVacationMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "collectiveVacationStart", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Whatsapp.prototype, "collectiveVacationEnd", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Queue_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "queueIdImportMessages", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Queue_1.default),
    __metadata("design:type", Queue_1.default)
], Whatsapp.prototype, "queueImport", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => FlowBuilder_1.FlowBuilderModel),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "flowIdNotPhrase", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => FlowBuilder_1.FlowBuilderModel),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Whatsapp.prototype, "flowIdWelcome", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => FlowBuilder_1.FlowBuilderModel),
    __metadata("design:type", FlowBuilder_1.FlowBuilderModel)
], Whatsapp.prototype, "flowBuilder", void 0);
Whatsapp = __decorate([
    sequelize_typescript_1.Table
], Whatsapp);
exports.default = Whatsapp;
