import * as Sentry from "@sentry/node";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  WAMessage,
  WAMessageKey,
  WASocket,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  isJidGroup,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  proto
} from "@whiskeysockets/baileys";
import { FindOptions } from "sequelize/types";
import Whatsapp from "../models/Whatsapp";
import logger from "../utils/logger";
import MAIN_LOGGER from "@whiskeysockets/baileys/lib/Utils/logger";
import { useMultiFileAuthState } from "../helpers/useMultiFileAuthState";
import { Boom } from "@hapi/boom";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import cacheLayer from "./cache";
import ImportWhatsAppMessageService from "../services/WhatsappService/ImportWhatsAppMessageService";
import { add } from "date-fns";
import moment from "moment";
import { getTypeMessage, isValidMsg } from "../services/WbotServices/wbotMessageListener";
import { addLogs } from "../helpers/addLogs";
import NodeCache from "node-cache";
import { Store } from "./store";

/**
 * Caches
 */
const msgRetryCounterCache = new NodeCache({
  stdTTL: 600,
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});
const msgCache = new NodeCache({
  stdTTL: 60,
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});

/**
 * Logger do Baileys (nível reduzido para evitar ruído)
 */
const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

/**
 * Extensão da sessão para carregar metadados que o restante do app já espera
 */
type Session = WASocket & {
  id?: number;
  store?: Store; // Mantido por compatibilidade (não utilizado sem makeInMemoryStore)
};

const sessions: Session[] = [];
const retriesQrCodeMap = new Map<number, number>();

/**
 * Utilitário de cache de mensagens (mantido por compatibilidade)
 */
export default function msg() {
  return {
    get: (key: WAMessageKey) => {
      const { id } = key;
      if (!id) return;
      const data = msgCache.get(id);
      if (data) {
        try {
          const parsed = JSON.parse(data as string);
          return parsed?.message;
        } catch (error) {
          logger.error(error);
        }
      }
    },
    save: (message: WAMessage) => {
      const { id } = message.key;
      try {
        msgCache.set(id as string, JSON.stringify(message));
      } catch (error) {
        logger.error(error);
      }
    }
  };
}

export var dataMessages: Record<number, any[]> = {};
export const msgDB = msg();

/**
 * Obtém a sessão WASocket já inicializada
 */
export const getWbot = (whatsappId: number): Session => {
  const idx = sessions.findIndex(s => s.id === whatsappId);
  if (idx === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[idx];
};

/**
 * Reinicia todas as sessões de uma company
 */
export const restartWbot = async (companyId: number): Promise<void> => {
  try {
    const options: FindOptions = {
      where: { companyId },
      attributes: ["id"]
    };
    const whatsapps = await Whatsapp.findAll(options);

    whatsapps.map(async c => {
      const i = sessions.findIndex(s => s.id === c.id);
      if (i !== -1) {
        // Fecha o websocket sem fazer logout forçado
        sessions[i].ws.close();
      }
    });
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Remove uma sessão (com opção de efetuar logout)
 */
export const removeWbot = async (whatsappId: number, isLogout = true): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        try {
          sessions[sessionIndex].logout();
        } catch (e) {
          logger.warn("Erro ao efetuar logout da sessão:", e);
        }
        try {
          sessions[sessionIndex].ws.close();
        } catch (e) {
          logger.warn("Erro ao fechar ws da sessão:", e);
        }
      }
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Inicializa uma sessão WhatsApp
 */
export const initWASocket = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      (async () => {
        const io = getIO();

        const whatsappUpdate = await Whatsapp.findOne({
          where: { id: whatsapp.id }
        });
        if (!whatsappUpdate) return;

        const { id, name, allowGroup, companyId } = whatsappUpdate;

        // Versão do WA Web via Baileys
        const { version, isLatest } = await fetchLatestBaileysVersion();
        logger.info(`Versão: v${version.join(".")}, isLatest: ${isLatest}`);
        logger.info(`Starting session ${name}`);

        let retriesQrCode = 0;
        let wsocket: Session | null = null;

        // Estado de autenticação em arquivos (multi-file) + key store cacheável
        const { state, saveCreds } = await useMultiFileAuthState(whatsapp);

        // Cria socket (sem makeInMemoryStore)
        wsocket = makeWASocket({
          version,
          logger: loggerBaileys,
          printQRInTerminal: false,
          auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, loggerBaileys)
          },
          generateHighQualityLinkPreview: true,
          linkPreviewImageThumbnailWidth: 192,
          shouldIgnoreJid: (jid: string) =>
            isJidBroadcast(jid) || (!allowGroup && isJidGroup(jid)),
          browser: Browsers.appropriate("Desktop"),
          defaultQueryTimeoutMs: undefined,
          // Compatível com sua infra de retries e cache:
          msgRetryCounterCache: {
            // adaptador mínimo para a interface esperada internamente
            get: (k: string) => (msgRetryCounterCache.get(k) as number) ?? 0,
            set: (k: string, v: number) => {
              msgRetryCounterCache.set(k, v);
            }
          } as any,
          markOnlineOnConnect: false,
          retryRequestDelayMs: 500,
          maxMsgRetryCount: 5,
          emitOwnEvents: true,
          fireInitQueries: true,
          transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
          connectTimeoutMs: 25_000,
          getMessage: msgDB.get,
          patchMessageBeforeSending(message: proto.IMessage) {
            // Converte PRODUCT_LIST para SINGLE_SELECT
            try {
              if (
                (message as any).deviceSentMessage?.message?.listMessage?.listType ===
                proto.Message.ListMessage.ListType.PRODUCT_LIST
              ) {
                const clone = JSON.parse(JSON.stringify(message));
                clone.deviceSentMessage.message.listMessage.listType =
                  proto.Message.ListMessage.ListType.SINGLE_SELECT;
                return clone;
              }
              if ((message as any).listMessage?.listType === proto.Message.ListMessage.ListType.PRODUCT_LIST) {
                const clone = JSON.parse(JSON.stringify(message));
                clone.listMessage.listType = proto.Message.ListMessage.ListType.SINGLE_SELECT;
                return clone;
              }
            } catch (e) {
              logger.warn("patchMessageBeforeSending failed:", e);
            }
            return message;
          }
        }) as Session;

        /**
         * Importação retroativa de mensagens (mantido)
         */
        setTimeout(async () => {
          const wpp = await Whatsapp.findByPk(whatsapp.id);
          if (wpp?.importOldMessages && wpp.status === "CONNECTED") {
            const dateOldLimit = new Date(wpp.importOldMessages).getTime();
            const dateRecentLimit = new Date(wpp.importRecentMessages).getTime();

            addLogs({
              fileName: `preparingImportMessagesWppId${whatsapp.id}.txt`,
              forceNewFile: true,
              text: `Aguardando conexão para iniciar a importação de mensagens:
Whatsapp nome: ${wpp.name}
Whatsapp Id: ${wpp.id}
Criação do arquivo de logs: ${moment().format("DD/MM/YYYY HH:mm:ss")}
Selecionado Data de inicio de importação: ${moment(dateOldLimit).format("DD/MM/YYYY HH:mm:ss")}
Selecionado Data final da importação: ${moment(dateRecentLimit).format("DD/MM/YYYY HH:mm:ss")}
`
            });

            const statusImportMessages = new Date().getTime();
            await wpp.update({ statusImportMessages });

            wsocket!.ev.on("messaging-history.set", async (messageSet: any) => {
              const statusImportMessages = new Date().getTime();
              await wpp.update({ statusImportMessages });

              const whatsappId = whatsapp.id;
              const filteredMessages = messageSet.messages || [];
              const filteredDateMessages: any[] = [];

              filteredMessages.forEach((msg: any) => {
                const tsLow = msg?.messageTimestamp?.low;
                const timestampMsg =
                  typeof tsLow === "number"
                    ? Math.floor(tsLow * 1000)
                    : Number(msg?.messageTimestamp) * 1000 || 0;

                if (isValidMsg(msg) && dateOldLimit < timestampMsg && dateRecentLimit > timestampMsg) {
                  const isGroup = msg?.key?.remoteJid?.split("@")[1] === "g.us";
                  if (!isGroup) {
                    addLogs({
                      fileName: `preparingImportMessagesWppId${whatsapp.id}.txt`,
                      text: `Adicionando mensagem para pos processamento:
Não é Mensagem de GRUPO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
Data e hora da mensagem: ${moment(timestampMsg).format("DD/MM/YYYY HH:mm:ss")}
Contato da Mensagem : ${msg.key?.remoteJid}
Tipo da mensagem : ${getTypeMessage(msg)}
`
                    });
                    filteredDateMessages.push(msg);
                  } else if (wpp?.importOldMessagesGroups) {
                    addLogs({
                      fileName: `preparingImportMessagesWppId${whatsapp.id}.txt`,
                      text: `Adicionando mensagem para pos processamento:
Mensagem de GRUPO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
Data e hora da mensagem: ${moment(timestampMsg).format("DD/MM/YYYY HH:mm:ss")}
Contato da Mensagem : ${msg.key?.remoteJid}
Tipo da mensagem : ${getTypeMessage(msg)}
`
                    });
                    filteredDateMessages.push(msg);
                  }
                }
              });

              if (!dataMessages?.[whatsappId]) {
                dataMessages[whatsappId] = [];
              }
              dataMessages[whatsappId].unshift(...filteredDateMessages);

              setTimeout(async () => {
                const wppReload = await Whatsapp.findByPk(whatsappId);

                io.of(String(companyId)).emit(`importMessages-${wppReload!.companyId}`, {
                  action: "update",
                  status: { this: -1, all: -1 }
                });

                io.of(String(companyId)).emit(`company-${companyId}-whatsappSession`, {
                  action: "update",
                  session: wppReload
                });
              }, 500);

              setTimeout(async () => {
                const wppReload = await Whatsapp.findByPk(whatsappId);
                if (wppReload?.importOldMessages) {
                  const isTimeStamp = !isNaN(new Date(Math.floor(parseInt(String(wppReload?.statusImportMessages)))).getTime());
                  if (isTimeStamp) {
                    const ultimoStatus = new Date(Math.floor(parseInt(String(wppReload?.statusImportMessages)))).getTime();
                    const dataLimite = +add(ultimoStatus, { seconds: 45 }).getTime();

                    if (dataLimite < new Date().getTime()) {
                      await ImportWhatsAppMessageService(wppReload.id);
                      await wppReload.update({ statusImportMessages: "Running" as any });
                    }
                  }
                }

                io.of(String(companyId)).emit(`company-${companyId}-whatsappSession`, {
                  action: "update",
                  session: wppReload
                });
              }, 1000 * 45);
            });
          }
        }, 2500);

        /**
         * Eventos de conexão
         */
        wsocket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
          logger.info(
            `Socket ${name} Connection Update ${connection || ""} ${lastDisconnect ? (lastDisconnect as any)?.error?.message : ""
            }`
          );

          if (connection === "close") {
            logger.info(
              `Socket ${name} Connection closed ${lastDisconnect ? (lastDisconnect as any)?.error?.message : ""
              }`
            );

            const statusCode = (lastDisconnect?.error as Boom | any)?.output?.statusCode;

            // 403 (ban / sem permissão) → limpa sessão e pendencia
            if (statusCode === 403) {
              await whatsapp.update({ status: "PENDING", session: "" });
              await DeleteBaileysService(whatsapp.id);
              await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);
              io.of(String(companyId)).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });
              await removeWbot(id, false);
            }

            if (statusCode !== DisconnectReason.loggedOut) {
              await removeWbot(id, false);
              setTimeout(() => StartWhatsAppSession(whatsapp, whatsapp.companyId), 2000);
            } else {
              await whatsapp.update({ status: "PENDING", session: "" });
              await DeleteBaileysService(whatsapp.id);
              await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);
              io.of(String(companyId)).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });
              await removeWbot(id, false);
              setTimeout(() => StartWhatsAppSession(whatsapp, whatsapp.companyId), 2000);
            }
          }

          if (connection === "open") {
            await whatsapp.update({
              status: "CONNECTED",
              qrcode: "",
              retries: 0,
              number:
                wsocket!.type === "md"
                  ? jidNormalizedUser((wsocket as WASocket).user!.id).split("@")[0]
                  : "-"
            });

            io.of(String(companyId)).emit(`company-${whatsapp.companyId}-whatsappSession`, {
              action: "update",
              session: whatsapp
            });

            const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
            if (sessionIndex === -1) {
              (wsocket as Session).id = whatsapp.id;
              sessions.push(wsocket as Session);
            }

            resolve(wsocket as Session);
          }

          if (qr !== undefined) {
            if ((retriesQrCodeMap.get(id) || 0) >= 3) {
              await whatsappUpdate.update({ status: "DISCONNECTED", qrcode: "" });
              await DeleteBaileysService(whatsappUpdate.id);
              await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);

              io.of(String(companyId)).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsappUpdate
              });

              wsocket!.ev.removeAllListeners("connection.update");
              try {
                wsocket!.ws.close();
              } catch { }
              wsocket = null;
              retriesQrCodeMap.delete(id);
            } else {
              logger.info(`Session QRCode Generate ${name}`);
              retriesQrCode = (retriesQrCode || 0) + 1;
              retriesQrCodeMap.set(id, retriesQrCode);

              await whatsapp.update({
                qrcode: qr,
                status: "qrcode",
                retries: 0,
                number: ""
              });

              const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
              if (sessionIndex === -1 && wsocket) {
                (wsocket as Session).id = whatsapp.id;
                sessions.push(wsocket as Session);
              }

              io.of(String(companyId)).emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });
            }
          }
        });

        // Persistência das credenciais
        wsocket.ev.on("creds.update", saveCreds);
      })();
    } catch (error) {
      Sentry.captureException(error);
      logger.error(error);
      reject(error);
    }
  });
};
