"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addColumn("Users", "allUserChat", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: "disabled"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Users", "allUserChat");
    }
};
