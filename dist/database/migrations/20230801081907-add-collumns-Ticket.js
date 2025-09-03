"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Tickets", "fromMe", {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }),
            queryInterface.addColumn("Tickets", "sendInactiveMessage", {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false
            }),
            queryInterface.addColumn("Tickets", "amountUsedBotQueuesNPS", {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false
            });
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Tickets", "fromMe"),
            queryInterface.removeColumn("Tickets", "sendInactiveMessage"),
            queryInterface.removeColumn("Tickets", "amountUsedBotQueuesNPS"),
        ]);
    }
};
