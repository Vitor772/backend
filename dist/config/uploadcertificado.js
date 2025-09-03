"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "certs");
exports.default = {
    directory: publicFolder,
    storage: multer_1.default.diskStorage({
        destination: publicFolder,
        filename(req, file, cb) {
            const desiredFileName = req.query.ref + path_1.default.extname(file.originalname);
            return cb(null, desiredFileName);
        }
    })
};
