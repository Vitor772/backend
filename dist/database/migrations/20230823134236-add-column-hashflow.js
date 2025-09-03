"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("Tickets", "hashFlowId", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("Tickets", "hashFlowId");
    }
};
