"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Tickets", "isActiveDemand", {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Tickets", "isActiveDemand");
    }
};
