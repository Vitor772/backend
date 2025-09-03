"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const ShowQueueService_1 = __importDefault(require("./ShowQueueService"));
const User_1 = __importDefault(require("../../models/User"));
const UpdateQueueService = async (queueId, queueData, companyId) => {
    const { color, name, chatbots } = queueData;
    const queueSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, "ERR_QUEUE_INVALID_NAME")
            .test("Check-unique-name", "ERR_QUEUE_NAME_ALREADY_EXISTS", async (value) => {
            if (value) {
                const queueWithSameName = await Queue_1.default.findOne({
                    where: { name: value, id: { [sequelize_1.Op.ne]: queueId }, companyId }
                });
                return !queueWithSameName;
            }
            return true;
        }),
        color: Yup.string()
            .required("ERR_QUEUE_INVALID_COLOR")
            .test("Check-color", "ERR_QUEUE_INVALID_COLOR", async (value) => {
            if (value) {
                const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
                return colorTestRegex.test(value);
            }
            return true;
        })
            .test("Check-color-exists", "ERR_QUEUE_COLOR_ALREADY_EXISTS", async (value) => {
            if (value) {
                const queueWithSameColor = await Queue_1.default.findOne({
                    where: { color: value, id: { [sequelize_1.Op.ne]: queueId }, companyId }
                });
                return !queueWithSameColor;
            }
            return true;
        })
    });
    try {
        await queueSchema.validate({ color, name });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const queue = await (0, ShowQueueService_1.default)(queueId, companyId);
    if (queue.companyId !== companyId) {
        throw new AppError_1.default("Não é permitido alterar registros de outra empresa");
    }
    if (chatbots) {
        await Promise.all(chatbots.map(async (bot) => {
            await Chatbot_1.default.upsert({ ...bot, queueId: queue.id });
        }));
        await Promise.all(queue.chatbots.map(async (oldBot) => {
            const stillExists = chatbots.findIndex(bot => bot.id === oldBot.id);
            if (stillExists === -1) {
                await Chatbot_1.default.destroy({ where: { id: oldBot.id } });
            }
        }));
    }
    await queue.update(queueData);
    await queue.reload({
        include: [
            {
                model: Chatbot_1.default,
                as: "chatbots",
                include: [
                    {
                        model: User_1.default,
                        as: "user"
                    },
                ],
                // attributes: ["id", "name", "greetingMessage"],
                order: [[{ model: Chatbot_1.default, as: "chatbots" }, "id", "asc"], ["id", "ASC"]]
            }
        ],
        order: [[{ model: Chatbot_1.default, as: "chatbots" }, "id", "asc"], ["id", "ASC"]]
    });
    return queue;
};
exports.default = UpdateQueueService;
