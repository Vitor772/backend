"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const privateFolder = path_1.default.resolve(__dirname, "..", "..", "private");
exports.default = {
    directory: privateFolder,
    storage: multer_1.default.diskStorage({
        destination: privateFolder,
        filename(req, file, cb) {
            const fileName = new Date().getTime() + path_1.default.extname(file.originalname);
            return cb(null, fileName);
        }
    })
};
