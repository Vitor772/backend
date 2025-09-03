"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbConfig = require("../../config/database");
const sequelize = new sequelize_typescript_1.Sequelize(dbConfig);
const ListMessagesServiceAll = async ({ companyId, fromMe, dateStart, dateEnd }) => {
    let ticketsCounter;
    if (dateStart && dateEnd) {
        if (fromMe) {
            ticketsCounter = await sequelize.query(`select COUNT(*) from "Messages" m where "companyId" = ${companyId} and "fromMe" = ${fromMe} and "createdAt"  between '${dateStart} 00:00:00' and '${dateEnd} 23:59:59'`, {
                type: sequelize_1.QueryTypes.SELECT
            });
        }
        else {
            ticketsCounter = await sequelize.query(`select COUNT(*) from "Messages" m where "companyId" = ${companyId} and "createdAt" between '${dateStart} 00:00:00' and '${dateEnd} 23:59:59'`, {
                type: sequelize_1.QueryTypes.SELECT
            });
        }
    }
    else {
        if (fromMe) {
            ticketsCounter = await sequelize.query(`select COUNT(*) from "Messages" m where "companyId" = ${companyId} and "fromMe" = ${fromMe}`, {
                type: sequelize_1.QueryTypes.SELECT
            });
        }
        else {
            ticketsCounter = await sequelize.query(`select COUNT(*) from "Messages" m where "companyId" = ${companyId}`, {
                type: sequelize_1.QueryTypes.SELECT
            });
        }
    }
    return {
        count: ticketsCounter,
    };
};
exports.default = ListMessagesServiceAll;
