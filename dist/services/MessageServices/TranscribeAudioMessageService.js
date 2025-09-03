"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const axios_1 = __importDefault(require("axios"));
const Setting_1 = __importDefault(require("../../models/Setting"));
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
async function fetchOpenAIToken() {
    let key_OPENAI_TOKEN = null;
    try {
        const buscacompanyId = 1;
        const getopenaitoken = await Setting_1.default.findOne({
            where: { companyId: buscacompanyId, key: "openaikeyaudio" },
        });
        key_OPENAI_TOKEN = getopenaitoken?.value;
        return key_OPENAI_TOKEN;
    }
    catch (error) {
        console.error("Error retrieving settings:", error);
        return null;
    }
}
// const openai = new OpenAI({ apiKey: OpenaiKEY });
const TranscribeAudioMessageToText = async (fileName, companyId) => {
    const token = await fetchOpenAIToken();
    const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
    const filePath = `${publicFolder}/company${companyId}/${fileName}`;
    if (!fs_1.default.existsSync(filePath)) {
        console.error(`Arquivo não encontrado: ${filePath}`);
        return 'Arquivo não encontrado';
    }
    try {
        const audioFile = fs_1.default.createReadStream(filePath);
        const form = new form_data_1.default();
        form.append('file', audioFile);
        form.append('model', 'whisper-1');
        form.append('response_format', 'text');
        form.append('language', 'pt');
        const response = await axios_1.default.post('https://api.openai.com/v1/audio/transcriptions', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`,
            },
        });
        return { transcribedText: response.data };
    }
    catch (error) {
        console.error(error);
        return 'Conversão pra texto falhou';
    }
};
exports.default = TranscribeAudioMessageToText;
