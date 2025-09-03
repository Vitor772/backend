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
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
let ScheduledMessages = class ScheduledMessages extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ScheduledMessages.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], ScheduledMessages.prototype, "data_mensagem_programada", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "id_conexao", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "intervalo", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "valor_intervalo", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], ScheduledMessages.prototype, "mensagem", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "tipo_dias_envio", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], ScheduledMessages.prototype, "mostrar_usuario_mensagem", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], ScheduledMessages.prototype, "criar_ticket", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB }),
    __metadata("design:type", Array)
], ScheduledMessages.prototype, "contatos", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.JSONB }),
    __metadata("design:type", Array)
], ScheduledMessages.prototype, "tags", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ScheduledMessages.prototype, "companyId", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "nome", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ScheduledMessages.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ScheduledMessages.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "mediaPath", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "mediaName", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "tipo_arquivo", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "usuario_envio", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ScheduledMessages.prototype, "enviar_quantas_vezes", void 0);
ScheduledMessages = __decorate([
    sequelize_typescript_1.Table
], ScheduledMessages);
exports.default = ScheduledMessages;
