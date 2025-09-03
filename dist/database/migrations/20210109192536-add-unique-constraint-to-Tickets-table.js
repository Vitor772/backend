"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: (queryInterface) => {
        return queryInterface.addConstraint("Tickets", ["id", "contactId", "companyId", "whatsappId"], {
            type: "unique",
            name: "contactid_companyid_whatsappid_unique"
        });
    },
    down: (queryInterface) => {
        return queryInterface.removeConstraint("Tickets", "contactid_companyid_whatsappid_unique");
    }
};
