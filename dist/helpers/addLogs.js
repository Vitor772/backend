"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLogs = void 0;
const fsp = __importStar(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
// const filePath = 'caminho/do/seu/arquivo.txt';
async function addLogs({ fileName, text, forceNewFile = false }) {
    const logs = path_1.default.resolve(__dirname, "..", "..", "logs");
    const filePath = path_1.default.resolve(logs, fileName);
    try {
        console.log(logs);
        if (!fs.existsSync(logs)) {
            fs.mkdirSync(logs);
        }
    }
    catch (error) {
    }
    try {
        if (forceNewFile) {
            await fsp.writeFile(filePath, `${text} \n`);
            console.log(`Novo Arquivo de log adicionado ${filePath}\n \n ${text}`);
        }
        else
            await fsp.appendFile(filePath, `${text} \n`);
        console.log(`Texto adicionado ao arquivo de log ${filePath}\n \n ${text}`);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            // O arquivo não existe, então cria e adiciona o texto
            await fsp.writeFile(filePath, `${text} \n`);
            console.log(`Novo Arquivo de log adicionado ${filePath}\n \n ${text}`);
        }
        else {
            console.error('Erro ao manipular o arquivo de log:', err);
        }
    }
}
exports.addLogs = addLogs;
