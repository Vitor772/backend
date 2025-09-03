"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addIndex("Messages", ["companyId"], {
                name: "idx_ms_company_id"
            })
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeIndex("Messages", "idx_ms_company_id")
        ]);
    }
};
