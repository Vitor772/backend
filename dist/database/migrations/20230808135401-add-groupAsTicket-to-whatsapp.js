"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Whatsapps", "groupAsTicket", {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: "disabled",
            allowNull: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Whatsapps", "groupAsTicket");
    }
};
