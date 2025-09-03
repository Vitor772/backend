"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const lodash_1 = require("lodash");
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "public");
exports.default = {
    directory: publicFolder,
    storage: multer_1.default.diskStorage({
        destination: async function (req, file, cb) {
            let companyId;
            companyId = req.user?.companyId;
            const { typeArch, fileId } = req.body;
            if (companyId === undefined && (0, lodash_1.isNil)(companyId) && (0, lodash_1.isEmpty)(companyId)) {
                const authHeader = req.headers.authorization;
                const [, token] = authHeader.split(" ");
                const whatsapp = await Whatsapp_1.default.findOne({ where: { token } });
                companyId = whatsapp.companyId;
            }
            let folder;
            if (typeArch && typeArch !== "announcements" && typeArch !== "logo") {
                folder = path_1.default.resolve(publicFolder, `company${companyId}`, typeArch, fileId ? fileId : "");
            }
            else if (typeArch && typeArch === "announcements") {
                folder = path_1.default.resolve(publicFolder, typeArch);
            }
            else if (typeArch === "logo") {
                folder = path_1.default.resolve(publicFolder);
            }
            else {
                folder = path_1.default.resolve(publicFolder, `company${companyId}`);
            }
            if (!fs_1.default.existsSync(folder)) {
                fs_1.default.mkdirSync(folder, { recursive: true });
                fs_1.default.chmodSync(folder, 0o777);
            }
            return cb(null, folder);
        },
        filename(req, file, cb) {
            const { typeArch } = req.body;
            const fileName = typeArch && typeArch !== "announcements" ? file.originalname.replace('/', '-').replace(/ /g, "_") : new Date().getTime() + '_' + file.originalname.replace('/', '-').replace(/ /g, "_");
            return cb(null, fileName);
        }
    })
};
