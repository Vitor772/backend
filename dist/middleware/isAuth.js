"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const AppError_1 = __importDefault(require("../errors/AppError"));
const auth_1 = __importDefault(require("../config/auth"));
const updateUser_1 = require("../helpers/updateUser");
const isAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new AppError_1.default("ERR_SESSION_EXPIRED", 401);
    }
    // const check = await verifyHelper();
    // if (!check) {
    //   throw new AppError("ERR_SYSTEM_INVALID", 401);
    // }
    const [, token] = authHeader.split(" ");
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, auth_1.default.secret);
        const { id, profile, companyId } = decoded;
        (0, updateUser_1.updateUser)(id, companyId);
        req.user = {
            id,
            profile,
            companyId
        };
    }
    catch (err) {
        if (err.message === "ERR_SESSION_EXPIRED" && err.statusCode === 401) {
            throw new AppError_1.default(err.message, 401);
        }
        else {
            throw new AppError_1.default("Invalid token. We'll try to assign a new one on next request", 403);
        }
    }
    return next();
};
exports.default = isAuth;
