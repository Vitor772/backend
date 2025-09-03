"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Chatbots", "optFileId", {
            type: sequelize_1.DataTypes.INTEGER,
            references: { model: "Files", key: "id" },
            defaultValue: null,
            allowNull: true
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Chatbots", "optFileId");
    }
};
