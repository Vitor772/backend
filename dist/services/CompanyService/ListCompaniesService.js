"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Company_1 = __importDefault(require("../../models/Company"));
const Plan_1 = __importDefault(require("../../models/Plan"));
const ListCompaniesService = async ({ searchParam = "", pageNumber = "1" }) => {
    const limit = 20;
    const offset = limit * (+pageNumber - 1);
    const { count, rows: companies } = await Company_1.default.findAndCountAll({
        include: [{
                model: Plan_1.default,
                as: "plan",
                attributes: ["name"]
            }],
        limit,
        offset,
        order: [["name", "ASC"]]
    });
    const hasMore = count > offset + companies.length;
    return {
        companies,
        count,
        hasMore
    };
};
exports.default = ListCompaniesService;
