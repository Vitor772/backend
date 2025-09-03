"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Schedules", "ticketUserId", {
            type: sequelize_1.DataTypes.INTEGER,
            references: { model: "Users", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        }),
            queryInterface.addColumn("Schedules", "whatsappId", {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Whatsapps", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            }),
            queryInterface.addColumn("Schedules", "queueId", {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Queues", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL"
            }),
            queryInterface.addColumn("Schedules", "statusTicket", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: "closed"
            });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Schedules", "userId"),
            queryInterface.removeColumn("Schedules", "queueId"),
            queryInterface.removeColumn("Schedules", "whatsappId"),
            queryInterface.removeColumn("Schedules", "statusTicket");
    }
};
