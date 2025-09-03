"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDate = void 0;
const moment_1 = __importDefault(require("moment"));
function useDate() {
    function dateToClient(strDate) {
        if ((0, moment_1.default)(strDate).isValid()) {
            return (0, moment_1.default)(strDate).format("DD/MM/YYYY");
        }
        return strDate;
    }
    function datetimeToClient(strDate) {
        if ((0, moment_1.default)(strDate).isValid()) {
            return (0, moment_1.default)(strDate).format("DD/MM/YYYY HH:mm");
        }
        return strDate;
    }
    function dateToDatabase(strDate) {
        if ((0, moment_1.default)(strDate, "DD/MM/YYYY").isValid()) {
            return (0, moment_1.default)(strDate).format("YYYY-MM-DD HH:mm:ss");
        }
        return strDate;
    }
    function returnDays(date) {
        let data1 = new Date();
        let data2 = new Date(date);
        let result = data2.getTime() - data1.getTime();
        let days = Math.ceil(result / (1000 * 60 * 60 * 24));
        if (days === -0) {
            days = 0;
        }
        return days;
    }
    return {
        dateToClient,
        datetimeToClient,
        dateToDatabase,
        returnDays
    };
}
exports.useDate = useDate;
