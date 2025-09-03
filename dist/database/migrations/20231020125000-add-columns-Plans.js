"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        return [
            await queryInterface.addColumn("Plans", "recurrence", {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            }),
            await queryInterface.addColumn("Plans", "trial", {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            }),
            await queryInterface.addColumn("Plans", "trialDays", {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            })
        ];
    },
    down: async (queryInterface) => {
        return [
            await queryInterface.removeColumn("Plans", "recurrence"),
            await queryInterface.removeColumn("Plans", "trial"),
            await queryInterface.removeColumn("Plans", "trialDays")
        ];
    }
};
