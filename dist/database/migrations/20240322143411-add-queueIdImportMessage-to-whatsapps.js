"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Whatsapps", "queueIdImportMessages", {
            references: { model: "Queues", key: "id" },
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: null,
            allowNull: true,
            onDelete: "SET NULL",
            onUpdate: "CASCADE"
        });
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Whatsapps", "queueIdImportMessages"),
        ]);
    }
};
