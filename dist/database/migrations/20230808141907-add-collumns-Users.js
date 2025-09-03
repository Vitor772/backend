"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Users", "allowGroup", {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }),
            queryInterface.addColumn("Users", "defaultTheme", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: "light",
                allowNull: false
            }),
            queryInterface.addColumn("Users", "defaultMenu", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: "closed",
                allowNull: false
            });
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Users", "allowGroup"),
            queryInterface.removeColumn("Users", "defaultTheme"),
            queryInterface.removeColumn("Users", "defaultMenu"),
        ]);
    }
};
