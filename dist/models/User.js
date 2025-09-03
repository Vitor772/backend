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
const bcryptjs_1 = require("bcryptjs");
const Ticket_1 = __importDefault(require("./Ticket"));
const Queue_1 = __importDefault(require("./Queue"));
const UserQueue_1 = __importDefault(require("./UserQueue"));
const Company_1 = __importDefault(require("./Company"));
const QuickMessage_1 = __importDefault(require("./QuickMessage"));
const Whatsapp_1 = __importDefault(require("./Whatsapp"));
const Chatbot_1 = __importDefault(require("./Chatbot"));
let User = class User extends sequelize_typescript_1.Model {
    constructor() {
        super(...arguments);
        this.checkPassword = async (password) => {
            return (0, bcryptjs_1.compare)(password, this.getDataValue("passwordHash"));
        };
    }
    static async updateChatbotsUsersReferences(user) {
        // Atualizar os registros na tabela Chatbots onde optQueueId é igual ao ID da fila que será excluída
        await Chatbot_1.default.update({ optUserId: null }, { where: { optUserId: user.id } });
    }
};
User.hashPassword = async (instance) => {
    if (instance.password) {
        instance.passwordHash = await (0, bcryptjs_1.hash)(instance.password, 8);
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.VIRTUAL),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], User.prototype, "tokenVersion", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("admin"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "profile", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(null),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Whatsapp_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], User.prototype, "whatsappId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Whatsapp_1.default),
    __metadata("design:type", Whatsapp_1.default)
], User.prototype, "whatsapp", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], User.prototype, "super", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], User.prototype, "online", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("00:00"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "startWork", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("23:59"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "endWork", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "color", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("disable"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "allTicket", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], User.prototype, "allowGroup", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("light"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "defaultTheme", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("closed"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "defaultMenu", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], User.prototype, "farewellMessage", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], User.prototype, "companyId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_1.default),
    __metadata("design:type", Company_1.default)
], User.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Ticket_1.default),
    __metadata("design:type", Array)
], User.prototype, "tickets", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Queue_1.default, () => UserQueue_1.default),
    __metadata("design:type", Array)
], User.prototype, "queues", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => QuickMessage_1.default, {
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        hooks: true
    }),
    __metadata("design:type", Array)
], User.prototype, "quickMessages", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("disabled"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "allHistoric", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Chatbot_1.default, {
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        hooks: true
    }),
    __metadata("design:type", Array)
], User.prototype, "chatbot", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("disabled"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "allUserChat", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("enabled"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "userClosePendingTicket", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("disabled"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "showDashboard", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(550),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], User.prototype, "defaultTicketsManagerWidth", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("disable"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "allowRealTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("disable"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "allowConnections", void 0);
__decorate([
    sequelize_typescript_1.BeforeUpdate,
    sequelize_typescript_1.BeforeCreate,
    __metadata("design:type", Object)
], User, "hashPassword", void 0);
__decorate([
    sequelize_typescript_1.BeforeDestroy,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User, "updateChatbotsUsersReferences", null);
User = __decorate([
    sequelize_typescript_1.Table
], User);
exports.default = User;
