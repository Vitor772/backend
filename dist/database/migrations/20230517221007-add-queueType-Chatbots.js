"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Chatbots", "queueType", {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: "text",
            allowNull: false
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Chatbots", "queueType");
    }
};
