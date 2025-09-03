"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstName = exports.hour = exports.date = exports.control = exports.msgsd = void 0;
const mustache_1 = __importDefault(require("mustache"));
function makeid(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const msgsd = () => {
    let ms = "";
    const hh = new Date().getHours();
    if (hh >= 6) {
        ms = "Bom dia";
    }
    if (hh > 11) {
        ms = "Boa tarde";
    }
    if (hh > 17) {
        ms = "Boa noite";
    }
    if (hh > 23 || hh < 6) {
        ms = "Boa madrugada";
    }
    return ms;
};
exports.msgsd = msgsd;
const control = () => {
    const Hr = new Date();
    const dd = ("0" + Hr.getDate()).slice(-2);
    const mm = ("0" + (Hr.getMonth() + 1)).slice(-2);
    const yyyy = Hr.getFullYear().toString();
    const minute = Hr.getMinutes().toString();
    const second = Hr.getSeconds().toString();
    const millisecond = Hr.getMilliseconds().toString();
    const ctrl = yyyy + mm + dd + minute + second + millisecond;
    return ctrl;
};
exports.control = control;
const date = () => {
    const Hr = new Date();
    const dd = ("0" + Hr.getDate()).slice(-2);
    const mm = ("0" + (Hr.getMonth() + 1)).slice(-2);
    const yy = Hr.getFullYear().toString();
    const dates = dd + "-" + mm + "-" + yy;
    return dates;
};
exports.date = date;
const hour = () => {
    const Hr = new Date();
    const hh = Hr.getHours();
    const min = ("0" + Hr.getMinutes()).slice(-2);
    const ss = ("0" + Hr.getSeconds()).slice(-2);
    const hours = hh + ":" + min + ":" + ss;
    return hours;
};
exports.hour = hour;
const firstName = (ticket) => {
    if (ticket && ticket?.contact?.name) {
        const nameArr = ticket?.contact?.name.split(' ');
        return nameArr[0];
    }
    return '';
};
exports.firstName = firstName;
exports.default = (body, ticket) => {
    const view = {
        firstName: (0, exports.firstName)(ticket),
        name: ticket ? ticket?.contact?.name : "",
        ticket_id: ticket ? ticket.id : "",
        userName: ticket ? ticket?.user?.name : "",
        ms: (0, exports.msgsd)(),
        hour: (0, exports.hour)(),
        date: (0, exports.date)(),
        queue: ticket ? ticket?.queue?.name : "",
        connection: ticket ? ticket?.whatsapp?.name : "",
        data_hora: new Array((0, exports.date)(), (0, exports.hour)()).join(" às "),
        protocol: new Array((0, exports.control)(), ticket ? ticket.id.toString() : "").join(""),
        name_company: ticket ? ticket?.company?.name : "",
    };
    return mustache_1.default.render(body, view);
};
