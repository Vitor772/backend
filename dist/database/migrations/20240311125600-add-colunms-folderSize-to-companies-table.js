"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Companies", "folderSize", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        }),
            queryInterface.addColumn("Companies", "numberFileFolder", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            }),
            queryInterface.addColumn("Companies", "updatedAtFolder", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Companies", "folderSize"),
            queryInterface.removeColumn("Companies", "numberFileFolder"),
            queryInterface.removeColumn("Companies", "updatedAtFolder");
    }
};
