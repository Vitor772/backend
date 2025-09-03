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
const User_1 = __importDefault(require("./User"));
const UserQueue_1 = __importDefault(require("./UserQueue"));
const Company_1 = __importDefault(require("./Company"));
const Whatsapp_1 = __importDefault(require("./Whatsapp"));
const WhatsappQueue_1 = __importDefault(require("./WhatsappQueue"));
const Chatbot_1 = __importDefault(require("./Chatbot"));
const QueueIntegrations_1 = __importDefault(require("./QueueIntegrations"));
const Files_1 = __importDefault(require("./Files"));
const Prompt_1 = __importDefault(require("./Prompt"));
let Queue = class Queue extends sequelize_typescript_1.Model {
    static async updateChatbotsQueueReferences(queue) {
        // Atualizar os registros na tabela Chatbots onde optQueueId é igual ao ID da fila que será excluída
        await Chatbot_1.default.update({ optQueueId: null }, { where: { optQueueId: queue.id } });
        await Whatsapp_1.default.update({ sendIdQueue: null, timeSendQueue: 0 }, { where: { sendIdQueue: queue.id, companyId: queue.companyId } });
        await Prompt_1.default.update({ queueId: null }, { where: { queueId: queue.id } });
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Queue.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Queue.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Queue.prototype, "color", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Queue.prototype, "greetingMessage", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Queue.prototype, "orderQueue", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Queue.prototype, "ativarRoteador", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Queue.prototype, "tempoRoteador", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Queue.prototype, "outOfHoursMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB
    }),
    __metadata("design:type", Array)
], Queue.prototype, "schedules", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Queue.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Queue.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Queue.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], Queue.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Whatsapp_1.default, () => WhatsappQueue_1.default),
    __metadata("design:type", Array)
], Queue.prototype, "whatsapps", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => User_1.default, () => UserQueue_1.default),
    __metadata("design:type", Array)
], Queue.prototype, "users", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Chatbot_1.default, {
        onDelete: "DELETE",
        onUpdate: "DELETE",
        hooks: true
    }),
    __metadata("design:type", Array)
], Queue.prototype, "chatbots", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => QueueIntegrations_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Queue.prototype, "integrationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => QueueIntegrations_1.default),
    __metadata("design:type", QueueIntegrations_1.default)
], Queue.prototype, "queueIntegrations", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Files_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Queue.prototype, "fileListId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Files_1.default),
    __metadata("design:type", Files_1.default)
], Queue.prototype, "files", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Queue.prototype, "closeTicket", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Prompt_1.default, {
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        hooks: true
    }),
    __metadata("design:type", Array)
], Queue.prototype, "prompt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Chatbot_1.default, {
        foreignKey: 'optQueueId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        hooks: true // Ativa hooks para esta associação
    }),
    __metadata("design:type", Array)
], Queue.prototype, "optQueue", void 0);
__decorate([
    sequelize_typescript_1.BeforeDestroy,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Queue]),
    __metadata("design:returntype", Promise)
], Queue, "updateChatbotsQueueReferences", null);
Queue = __decorate([
    sequelize_typescript_1.Table
], Queue);
exports.default = Queue;
