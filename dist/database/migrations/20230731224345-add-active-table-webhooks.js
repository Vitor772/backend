"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("Webhooks", "active", {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        });
        await queryInterface.addColumn("Webhooks", "requestMonth", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        });
        await queryInterface.addColumn("Webhooks", "requestAll", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("Webhooks", "active");
        await queryInterface.removeColumn("Webhooks", "requestMonth");
        await queryInterface.removeColumn("Webhooks", "requestAll");
    }
};
