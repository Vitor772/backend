"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Whatsapps", "collectiveVacationEnd", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        }),
            queryInterface.addColumn("Whatsapps", "collectiveVacationMessage", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
                defaultValue: ""
            }),
            queryInterface.addColumn("Whatsapps", "collectiveVacationStart", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
                defaultValue: null
            });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Whatsapps", "collectiveVacationEnd"),
            queryInterface.removeColumn("Whatsapps", "collectiveVacationMessage"),
            queryInterface.removeColumn("Whatsapps", "collectiveVacationStart");
    }
};
