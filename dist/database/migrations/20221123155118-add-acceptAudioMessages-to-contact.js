"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Contacts", "acceptAudioMessage", {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Contacts", "acceptAudioMessage");
    }
};
