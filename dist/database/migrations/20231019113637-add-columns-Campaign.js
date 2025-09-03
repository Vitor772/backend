"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Campaigns", "userId", {
            type: sequelize_1.DataTypes.INTEGER,
            references: { model: "Users", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        }),
            queryInterface.addColumn("Campaigns", "queueId", {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Queues", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            }),
            queryInterface.addColumn("Campaigns", "statusTicket", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: "closed"
            });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Campaigns", "userId"),
            queryInterface.removeColumn("Campaigns", "queueId"),
            queryInterface.removeColumn("Campaigns", "statusTicket");
    }
};
