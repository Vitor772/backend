"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Plans", "amount", {
            type: sequelize_1.DataTypes.STRING,
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Plans", "amount");
    }
};
