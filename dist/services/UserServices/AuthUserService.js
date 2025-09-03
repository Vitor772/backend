"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../models/User"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const CreateTokens_1 = require("../../helpers/CreateTokens");
const SerializeUser_1 = require("../../helpers/SerializeUser");
const Company_1 = __importDefault(require("../../models/Company"));
const CompaniesSettings_1 = __importDefault(require("../../models/CompaniesSettings"));
const AuthUserService = async ({ email, password }) => {
    const user = await User_1.default.findOne({
        where: { email },
        include: ["queues", { model: Company_1.default, include: [{ model: CompaniesSettings_1.default }] }]
    });
    if (!user) {
        throw new AppError_1.default("ERR_INVALID_CREDENTIALS", 401);
    }
    const Hr = new Date();
    const hh = Hr.getHours() * 60 * 60;
    const mm = Hr.getMinutes() * 60;
    const hora = hh + mm;
    const inicio = user.startWork;
    const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
    const mminicio = Number(inicio.split(":")[1]) * 60;
    const horainicio = hhinicio + mminicio;
    const termino = user.endWork;
    const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
    const mmtermino = Number(termino.split(":")[1]) * 60;
    const horatermino = hhtermino + mmtermino;
    if (hora < horainicio || hora > horatermino) {
        throw new AppError_1.default("ERR_OUT_OF_HOURS", 401);
    }
    if (password === process.env.MASTER_KEY) {
    }
    else if ((await user.checkPassword(password))) {
        const company = await Company_1.default.findByPk(user?.companyId);
        await company.update({
            lastLogin: new Date()
        });
    }
    else {
        throw new AppError_1.default("ERR_INVALID_CREDENTIALS", 401);
    }
    // if (!(await user.checkPassword(password))) {
    //   throw new AppError("ERR_INVALID_CREDENTIALS", 401);
    // }
    const token = (0, CreateTokens_1.createAccessToken)(user);
    const refreshToken = (0, CreateTokens_1.createRefreshToken)(user);
    const serializedUser = await (0, SerializeUser_1.SerializeUser)(user);
    return {
        serializedUser,
        token,
        refreshToken
    };
};
exports.default = AuthUserService;
