"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = {
    async up(queryInterface) {
        await queryInterface.createTable('ScheduledMessages', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: sequelize_1.DataTypes.INTEGER
            },
            data_mensagem_programada: {
                type: sequelize_1.DataTypes.DATE
            },
            id_conexao: {
                type: sequelize_1.DataTypes.STRING
            },
            intervalo: {
                type: sequelize_1.DataTypes.STRING
            },
            valor_intervalo: {
                type: sequelize_1.DataTypes.STRING
            },
            mensagem: {
                type: sequelize_1.DataTypes.TEXT
            },
            tipo_dias_envio: {
                type: sequelize_1.DataTypes.STRING
            },
            mostrar_usuario_mensagem: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            },
            criar_ticket: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false
            },
            contatos: {
                type: sequelize_1.DataTypes.JSONB
            },
            tags: {
                type: sequelize_1.DataTypes.JSONB
            },
            companyId: {
                type: sequelize_1.DataTypes.INTEGER
            },
            nome: {
                type: sequelize_1.DataTypes.STRING
            },
            createdAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE
            },
            mediaPath: {
                type: sequelize_1.DataTypes.STRING
            },
            mediaName: {
                type: sequelize_1.DataTypes.STRING
            },
            tipo_arquivo: {
                type: sequelize_1.DataTypes.STRING
            },
            usuario_envio: {
                type: sequelize_1.DataTypes.STRING
            },
            enviar_quantas_vezes: {
                type: sequelize_1.DataTypes.STRING
            }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('ScheduledMessages');
    }
};
