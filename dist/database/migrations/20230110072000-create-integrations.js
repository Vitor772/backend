"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("Integrations", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER,
                references: { model: "Companies", key: "id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                allowNull: false
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            },
            token: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            },
            foneContact: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            },
            userLogin: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            },
            passLogin: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            },
            finalCurrentMonth: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true
            },
            initialCurrentMonth: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true
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
        return queryInterface.dropTable("Integrations");
    }
};
