"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Queues", "fileListId", {
            type: sequelize_1.DataTypes.INTEGER,
            references: { model: "Files", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Queues", "fileListId");
    }
};
