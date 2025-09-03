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
const Tag_1 = __importDefault(require("./Tag"));
const Contact_1 = __importDefault(require("./Contact"));
let ContactTag = class ContactTag extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Contact_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ContactTag.prototype, "contactId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Tag_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ContactTag.prototype, "tagId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Contact_1.default),
    __metadata("design:type", Contact_1.default)
], ContactTag.prototype, "contact", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Tag_1.default),
    __metadata("design:type", Tag_1.default)
], ContactTag.prototype, "tags", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ContactTag.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ContactTag.prototype, "updatedAt", void 0);
ContactTag = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: "ContactTags"
    })
], ContactTag);
exports.default = ContactTag;
