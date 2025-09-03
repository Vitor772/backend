"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("Invoices", {
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
            dueDate: {
                type: sequelize_1.DataTypes.STRING,
            },
            detail: {
                type: sequelize_1.DataTypes.STRING,
            },
            status: {
                type: sequelize_1.DataTypes.STRING,
            },
            value: {
                type: sequelize_1.DataTypes.FLOAT
            },
            users: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            connections: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            queues: {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            },
            useWhatsapp: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true
            },
            useFacebook: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true
            },
            useInstagram: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true
            },
            useCampaigns: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true
            },
            useSchedules: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true
            },
            useInternalChat: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true
            },
            useExternalApi: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false
            },
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable("Invoices");
    }
};
