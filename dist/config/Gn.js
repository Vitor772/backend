"use strict";
/* import path from "path";

 const name = process.env.GERENCIANET_SANDBOX === "false" ? "producao" : "homologacao";

 const cert = path.join(
  __dirname,
  `../../certs/${process.env.GERENCIANET_PIX_CERT}.p12`
);

export = {
  sandbox: process.env.GERENCIANET_SANDBOX === "true",
  client_id: process.env.GERENCIANET_CLIENT_ID as string,
  client_secret: process.env.GERENCIANET_CLIENT_SECRET as string,
  pix_cert: cert
};
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const Setting_1 = __importDefault(require("../models/Setting"));
async function getSettingValue(key) {
    try {
        const buscacompanyId = 1;
        const setting = await Setting_1.default.findOne({ where: { companyId: buscacompanyId, key } });
        return setting?.value;
    }
    catch (error) {
        console.error("Error retrieving setting:", error);
        return undefined;
    }
}
const cert = path_1.default.join(__dirname, `../../certs/certificadoEfi.p12`);
const config = {
    sandbox: false,
    client_id: process.env.GERENCIANET_CLIENT_ID,
    client_secret: process.env.GERENCIANET_CLIENT_SECRET,
    pix_cert: cert
};
(async () => {
    config.client_id = await getSettingValue("eficlientid");
    config.client_secret = await getSettingValue("eficlientsecret");
    // Use the 'config' object as needed
    console.log(config);
})();
module.exports = config;
