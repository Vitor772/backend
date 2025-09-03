"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const socket_1 = require("../libs/socket");
const ShowUserService_1 = __importDefault(require("../services/UserServices/ShowUserService"));
const updateUser = async (userId, companyId) => {
    const user = await (0, ShowUserService_1.default)(userId, companyId);
    user.changed('updatedAt', true);
    let update = null;
    update = { updatedAt: new Date() };
    if (!user.online) {
        // console.log("updateUser", user.online, update)
        update = { ...update, online: true };
        await user.update(update);
        await user.reload();
        const io = (0, socket_1.getIO)();
        io.of(String(companyId))
            .emit(`company-${user.companyId}-user`, {
            action: "update",
            user
        });
    }
    else {
        await user.update(update);
    }
};
exports.updateUser = updateUser;
