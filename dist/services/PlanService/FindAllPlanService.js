"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Plan_1 = __importDefault(require("../../models/Plan"));
const FindAllPlanService = async (listPublic) => {
    let plan;
    if (listPublic === "false") {
        plan = await Plan_1.default.findAll({
            where: {
                isPublic: true
            },
            order: [["name", "ASC"]]
        });
    }
    else {
        plan = await Plan_1.default.findAll({
            order: [["name", "ASC"]]
        });
    }
    return plan;
};
exports.default = FindAllPlanService;
