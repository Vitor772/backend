"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.index = void 0;
const Versions_1 = __importDefault(require("../models/Versions"));
const index = async (req, res) => {
    const version = await Versions_1.default.findByPk(1);
    return res.status(200).json({
        version: version.versionFrontend
    });
};
exports.index = index;
const store = async (req, res) => {
    const version = await Versions_1.default.findByPk(1);
    version.versionFrontend = req.body.version;
    await version.save();
    return res.status(200).json({
        version: version.versionFrontend
    });
};
exports.store = store;
