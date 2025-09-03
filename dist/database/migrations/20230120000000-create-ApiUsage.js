"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("ApiUsages", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            dateUsed: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false
            },
            UsedOnDay: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            usedText: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            usedPDF: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            usedImage: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            usedVideo: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            usedOther: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            usedCheckNumber: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable("ApiUsages");
    }
};
