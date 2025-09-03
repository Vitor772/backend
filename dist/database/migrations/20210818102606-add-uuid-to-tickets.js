"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'),
            queryInterface.addColumn("Tickets", "uuid", {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
                //defaultValue: Sequelize.literal('uuid_generate_v4()')
                defaultValue: require('sequelize').UUIDV4,
            })
        ]);
    },
    down: (queryInterface) => {
        return queryInterface.removeColumn("Tickets", "uuid");
    }
};
