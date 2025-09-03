"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../models/User"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const Company_1 = __importDefault(require("../../models/Company"));
const Plan_1 = __importDefault(require("../../models/Plan"));
const ShowUserService = async (id, companyId) => {
    const user = await User_1.default.findOne({
        where: {
            id,
            companyId
        },
        attributes: [
            "id",
            "name",
            "email",
            "profile",
            "profileImage",
            "super",
            "whatsappId",
            "online",
            "startWork",
            "endWork",
            "allTicket",
            "companyId",
            "tokenVersion",
            "defaultTheme",
            "allowGroup",
            "defaultMenu",
            "farewellMessage",
            "userClosePendingTicket",
            "showDashboard",
            "defaultTicketsManagerWidth",
            "allUserChat",
            "allHistoric",
            "allowRealTime",
            "allowConnections"
        ],
        include: [
            { model: Queue_1.default, as: "queues", attributes: ["id", "name", "color"] },
            {
                model: Company_1.default,
                as: "company",
                attributes: ["id", "name", "dueDate", "document"],
                include: [
                    {
                        model: Plan_1.default, as: "plan",
                        attributes: ["id",
                            "name",
                            "amount",
                            "useWhatsapp",
                            "useFacebook",
                            "useInstagram",
                            "useCampaigns",
                            "useSchedules",
                            "useInternalChat",
                            "useExternalApi",
                            "useIntegrations",
                            "useOpenAi",
                            "useKanban"
                        ]
                    },
                ]
            },
        ]
    });
    if (!user) {
        throw new AppError_1.default("ERR_NO_USER_FOUND", 404);
    }
    return user;
};
exports.default = ShowUserService;
