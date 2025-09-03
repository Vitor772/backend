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
const uuid_1 = require("uuid");
const Contact_1 = __importDefault(require("./Contact"));
const Message_1 = __importDefault(require("./Message"));
const Queue_1 = __importDefault(require("./Queue"));
const User_1 = __importDefault(require("./User"));
const Whatsapp_1 = __importDefault(require("./Whatsapp"));
const Company_1 = __importDefault(require("./Company"));
const Tag_1 = __importDefault(require("./Tag"));
const TicketTag_1 = __importDefault(require("./TicketTag"));
const QueueIntegrations_1 = __importDefault(require("./QueueIntegrations"));
let Ticket = class Ticket extends sequelize_typescript_1.Model {
    ;
    static setUUID(ticket) {
        ticket.uuid = (0, uuid_1.v4)();
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ defaultValue: "pending" }),
    __metadata("design:type", String)
], Ticket.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "unreadMessages", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Ticket.prototype, "flowWebhook", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Ticket.prototype, "lastFlowId", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Ticket.prototype, "hashFlowId", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Ticket.prototype, "flowStopped", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Ticket.prototype, "dataWebhook", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Ticket.prototype, "lastMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Ticket.prototype, "isGroup", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Ticket.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Ticket.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.default),
    __metadata("design:type", User_1.default)
], Ticket.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Contact_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "contactId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Contact_1.default),
    __metadata("design:type", Contact_1.default)
], Ticket.prototype, "contact", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Whatsapp_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "whatsappId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Whatsapp_1.default),
    __metadata("design:type", Whatsapp_1.default)
], Ticket.prototype, "whatsapp", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Queue_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "queueId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Queue_1.default),
    __metadata("design:type", Queue_1.default)
], Ticket.prototype, "queue", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Ticket.prototype, "isBot", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Message_1.default),
    __metadata("design:type", Array)
], Ticket.prototype, "messages", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => TicketTag_1.default),
    __metadata("design:type", Array)
], Ticket.prototype, "ticketTags", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Tag_1.default, () => TicketTag_1.default),
    __metadata("design:type", Array)
], Ticket.prototype, "tags", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], Ticket.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)((0, uuid_1.v4)()),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Ticket.prototype, "uuid", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("whatsapp"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Ticket.prototype, "channel", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "amountUsedBotQueues", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "amountUsedBotQueuesNPS", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Ticket.prototype, "fromMe", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Ticket.prototype, "sendInactiveMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Ticket.prototype, "lgpdSendMessageAt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Ticket.prototype, "lgpdAcceptedAt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Ticket.prototype, "imported", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Ticket.prototype, "isOutOfHour", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Ticket.prototype, "useIntegration", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => QueueIntegrations_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Ticket.prototype, "integrationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => QueueIntegrations_1.default),
    __metadata("design:type", QueueIntegrations_1.default)
], Ticket.prototype, "queueIntegration", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Ticket.prototype, "isActiveDemand", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Ticket.prototype, "typebotSessionId", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Ticket.prototype, "typebotStatus", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Ticket.prototype, "typebotSessionTime", void 0);
__decorate([
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Ticket]),
    __metadata("design:returntype", void 0)
], Ticket, "setUUID", null);
Ticket = __decorate([
    sequelize_typescript_1.Table
], Ticket);
exports.default = Ticket;
