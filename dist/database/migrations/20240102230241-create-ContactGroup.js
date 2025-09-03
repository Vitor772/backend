"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    async up(queryInterface) {
        await queryInterface.createTable('ContactGroups', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: sequelize_1.DataTypes.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            },
            contactId: {
                type: sequelize_1.DataTypes.INTEGER
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('ContactGroups');
    }
};
