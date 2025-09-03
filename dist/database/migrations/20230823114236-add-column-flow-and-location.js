"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("Tickets", "flowWebhook", {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
        await queryInterface.addColumn("Tickets", "lastFlowId", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("Tickets", "flowWebhook");
        await queryInterface.removeColumn("Tickets", "lastFlowId");
    }
};
