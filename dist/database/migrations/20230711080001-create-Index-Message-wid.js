"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: (queryInterface) => {
        return Promise.all([
            queryInterface.addIndex("Messages", ["wid"], {
                name: "idx_messages_wid"
            }),
        ]);
    },
    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeIndex("Messages", "idx_messages_wid")
        ]);
    }
};
