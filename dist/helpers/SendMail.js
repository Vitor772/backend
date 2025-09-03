"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function SendMail(mailData) {
    const options = {
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    };
    const transporter = nodemailer_1.default.createTransport(options);
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: mailData.to,
        subject: mailData.subject,
        text: mailData.text,
        html: mailData.html || mailData.text // html body
    });
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
exports.SendMail = SendMail;
