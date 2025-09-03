"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @TercioSantos-0 |
 * migração/CompaniesSettings |
 * @descrição:migração tabela para configurações das empresas
 */
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable("CompaniesSettings", {
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
                onDelete: "CASCADE",
                allowNull: false
            },
            hoursCloseTicketsAuto: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            chatBotType: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            acceptCallWhatsapp: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            userRandom: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            sendGreetingMessageOneQueues: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            sendSignMessage: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            sendFarewellWaitingTicket: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            userRating: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            sendGreetingAccepted: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            CheckMsgIsGroup: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            sendQueuePosition: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            scheduleType: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            acceptAudioMessageContact: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            enableLGPD: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            sendMsgTransfTicket: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            requiredTag: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            lgpdDeleteMessage: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            lgpdHideNumber: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            lgpdConsent: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            lgpdLink: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            },
            lgpdMessage: {
                type: sequelize_1.DataTypes.TEXT,
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
        return queryInterface.dropTable("CompaniesSettings");
    }
};
