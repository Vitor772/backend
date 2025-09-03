"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializeUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SerializeUser = async (user) => {
    // Gera um token de 32 bytes
    const generateToken = (userId) => {
        // Gerar o token com base no userId e sua chave secreta
        const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Você pode definir o tempo de expiração conforme necessário
        return token;
    };
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        companyId: user.companyId,
        company: user.company,
        super: user.super,
        queues: user.queues,
        startWork: user.startWork,
        endWork: user.endWork,
        allTicket: user.allTicket,
        whatsappId: user.whatsappId,
        profileImage: user.profileImage,
        defaultTheme: user.defaultTheme,
        defaultMenu: user.defaultMenu,
        allHistoric: user.allHistoric,
        allUserChat: user.allUserChat,
        defaultTicketsManagerWidth: user.defaultTicketsManagerWidth,
        userClosePendingTicket: user.userClosePendingTicket,
        showDashboard: user.showDashboard,
        token: generateToken(user.id),
        allowGroup: user.allowGroup,
        allowRealTime: user.allowRealTime,
        allowConnections: user.allowConnections
    };
};
exports.SerializeUser = SerializeUser;
