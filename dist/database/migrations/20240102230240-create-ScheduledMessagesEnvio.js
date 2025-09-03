"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    async up(queryInterface) {
        await queryInterface.createTable('ScheduledMessagesEnvios', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: sequelize_1.DataTypes.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            },
            mediaPath: {
                type: sequelize_1.DataTypes.STRING
            },
            mediaName: {
                type: sequelize_1.DataTypes.STRING
            },
            mensagem: {
                type: sequelize_1.DataTypes.TEXT
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER
            },
            data_envio: {
                type: sequelize_1.DataTypes.DATE
            },
            scheduledmessages: {
                type: sequelize_1.DataTypes.INTEGER
            },
            key: {
                type: sequelize_1.DataTypes.STRING
            }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('ScheduledMessagesEnvios');
    }
};
