"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("TicketTraking", "closedAt", {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: null
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("TicketTraking", "closedAt");
    }
};
