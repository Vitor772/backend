"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("FlowBuilders", "company_id", {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        });
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn("FlowBuilders", "company_id");
    }
};
