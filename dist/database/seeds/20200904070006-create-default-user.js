"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = require("bcryptjs");
module.exports = {
    up: async (queryInterface) => {
        return queryInterface.sequelize.transaction(async (t) => {
            const userExists = await queryInterface.rawSelect('Users', {
                where: {
                    id: 1,
                },
            }, ['id']);
            if (!userExists) {
                const passwordHash = await (0, bcryptjs_1.hash)("adminpro", 8);
                return queryInterface.bulkInsert('Users', [{
                        name: "Admin",
                        email: "admin@admin.com",
                        profile: "admin",
                        passwordHash,
                        companyId: 1,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        super: true
                    }], { transaction: t });
            }
        });
    },
    down: async (queryInterface) => {
        return queryInterface.bulkDelete("Users", { id: 1 });
    }
};
