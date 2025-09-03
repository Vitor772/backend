"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("CompaniesSettings", "transferMessage", {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            defaultValue: ""
        }),
            queryInterface.addColumn("CompaniesSettings", "greetingAcceptedMessage", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                defaultValue: ""
            }),
            queryInterface.addColumn("CompaniesSettings", "AcceptCallWhatsappMessage", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                defaultValue: ""
            }),
            queryInterface.addColumn("CompaniesSettings", "sendQueuePositionMessage", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                defaultValue: ""
            });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("CompaniesSettings", "transferMessage"),
            queryInterface.removeColumn("CompaniesSettings", "greetingAcceptedMessage"),
            queryInterface.removeColumn("CompaniesSettings", "AcceptCallWhatsappMessage"),
            queryInterface.removeColumn("CompaniesSettings", "sendQueuePositionMessage");
    }
};
