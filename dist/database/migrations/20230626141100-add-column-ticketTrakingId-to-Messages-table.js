"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Messages", "ticketTrakingId", {
            type: sequelize_1.DataTypes.INTEGER,
            references: { model: "TicketTraking", key: "id" },
            onUpdate: "SET NULL",
            onDelete: "SET NULL"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Messages", "ticketTrakingId");
    }
};
