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
var Chatbot_1;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Queue_1 = __importDefault(require("./Queue"));
const User_1 = __importDefault(require("./User"));
const QueueIntegrations_1 = __importDefault(require("./QueueIntegrations"));
const Files_1 = __importDefault(require("./Files"));
let Chatbot = Chatbot_1 = class Chatbot extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Chatbot.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Chatbot.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Chatbot.prototype, "greetingMessage", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Queue_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Chatbot.prototype, "queueId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Queue_1.default, "queueId"),
    __metadata("design:type", Queue_1.default)
], Chatbot.prototype, "queue", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Chatbot_1),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Chatbot.prototype, "chatbotId", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Chatbot.prototype, "isAgent", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Chatbot_1),
    __metadata("design:type", Chatbot)
], Chatbot.prototype, "mainChatbot", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Chatbot_1),
    __metadata("design:type", Array)
], Chatbot.prototype, "options", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Chatbot.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Chatbot.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Chatbot.prototype, "queueType", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Queue_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Chatbot.prototype, "optQueueId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Queue_1.default, "optQueueId"),
    __metadata("design:type", Queue_1.default)
], Chatbot.prototype, "optQueue", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Chatbot.prototype, "optUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.default),
    __metadata("design:type", User_1.default)
], Chatbot.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => QueueIntegrations_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Chatbot.prototype, "optIntegrationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => QueueIntegrations_1.default),
    __metadata("design:type", QueueIntegrations_1.default)
], Chatbot.prototype, "queueIntegrations", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Files_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Chatbot.prototype, "optFileId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Files_1.default),
    __metadata("design:type", Files_1.default)
], Chatbot.prototype, "file", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Chatbot.prototype, "closeTicket", void 0);
Chatbot = Chatbot_1 = __decorate([
    sequelize_typescript_1.Table
], Chatbot);
exports.default = Chatbot;
