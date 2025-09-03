"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Schedules", "intervalo", {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 1
        }),
            queryInterface.addColumn("Schedules", "valorIntervalo", {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            }),
            queryInterface.addColumn("Schedules", "enviarQuantasVezes", {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 1
            }),
            queryInterface.addColumn("Schedules", "tipoDias", {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 4
            }),
            queryInterface.addColumn("Schedules", "contadorEnvio", {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            }),
            queryInterface.addColumn("Schedules", "assinar", {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Schedules", "intervalo"),
            queryInterface.removeColumn("Schedules", "valorIntervalo"),
            queryInterface.removeColumn("Schedules", "enviarQuantasVezes"),
            queryInterface.removeColumn("Schedules", "tipoDias"),
            queryInterface.removeColumn("Schedules", "contadorEnvio"),
            queryInterface.removeColumn("Schedules", "assinar");
    }
};
