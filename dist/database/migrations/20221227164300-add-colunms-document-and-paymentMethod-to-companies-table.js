"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addColumn("Companies", "document", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: ""
            }),
            queryInterface.addColumn("Companies", "paymentMethod", {
                type: sequelize_1.DataTypes.STRING,
                defaultValue: ""
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Companies", "document"),
            queryInterface.removeColumn("Companies", "paymentMethod")
        ]);
    }
};
