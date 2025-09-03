"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Schedules", "openTicket", {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: "disabled"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Schedules", "openTicket");
    }
};
