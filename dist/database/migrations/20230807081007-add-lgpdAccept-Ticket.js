"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Tickets", "lgpdAcceptedAt", {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: null,
            allowNull: true
        }),
            queryInterface.addColumn("Tickets", "lgpdSendMessageAt", {
                type: sequelize_1.DataTypes.DATE,
                defaultValue: null,
                allowNull: true
            });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Tickets", "lgpdAcceptedAt"),
            queryInterface.removeColumn("Tickets", "lgpdSendMessageAt");
    }
};
