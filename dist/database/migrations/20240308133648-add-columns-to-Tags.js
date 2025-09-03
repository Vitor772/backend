"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Tags", "timeLane", {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true
        }),
            queryInterface.addColumn("Tags", "nextLaneId", {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true
            }),
            queryInterface.addColumn("Tags", "greetingMessageLane", {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true
            });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Tags", "timeLane"),
            queryInterface.removeColumn("Tags", "nextLaneId"),
            queryInterface.removeColumn("Tags", "greetingMessageLane");
    }
};
