"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("Partners", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            phone: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            },
            email: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            },
            document: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
                unique: true
            },
            commission: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            typeCommission: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            walletId: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
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
        return queryInterface.dropTable("Partners");
    }
};
