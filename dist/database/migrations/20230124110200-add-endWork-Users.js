"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Users", "endWork", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: "23:59"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Users", "endWork");
    }
};
