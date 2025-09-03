"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addColumn("Whatsapps", "expiresInactiveMessage", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: ""
            }),
            queryInterface.addColumn("Whatsapps", "inactiveMessage", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: ""
            }),
            queryInterface.addColumn("Whatsapps", "timeInactiveMessage", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: ""
            }),
            queryInterface.addColumn("Whatsapps", "maxUseBotQueuesNPS", {
                type: sequelize_1.DataTypes.INTEGER,
                defaultValue: 0
            }),
            queryInterface.addColumn("Whatsapps", "whenExpiresTicket", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: ""
            }),
            queryInterface.addColumn("Whatsapps", "expiresTicketNPS", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: ""
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Whatsapps", "expiresInactiveMessage"),
            queryInterface.removeColumn("Whatsapps", "inactiveMessage"),
            queryInterface.removeColumn("Whatsapps", "timeInactiveMessage"),
            queryInterface.removeColumn("Whatsapps", "maxUseBotQueuesNPS"),
            queryInterface.removeColumn("Whatsapps", "whenExpiresTicket"),
            queryInterface.removeColumn("Whatsapps", "expiresTicketNPS"),
        ]);
    }
};
