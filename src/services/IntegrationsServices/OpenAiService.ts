import { MessageUpsertType, proto, WASocket } from "@whiskeysockets/baileys";
import {
  convertTextToSpeechAndSaveToFile,
  getBodyMessage,
  keepOnlySpecifiedChars,
  transferQueue,
  verifyMediaMessage,
  verifyMessage
} from "../WbotServices/wbotMessageListener";

import { isNil, isNull } from "lodash";

import fs from "fs";
import path, { join } from "path";

import OpenAI from "openai";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import TicketTraking from "../../models/TicketTraking";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import Whatsapp from "../../models/Whatsapp";

type Session = WASocket & {
  id?: number;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMe {
  name: string;
  id: string;
}

interface SessionOpenAi extends OpenAI {
  id?: number;
}
const sessionsOpenAi: SessionOpenAi[] = [];

interface IOpenAi {
  name: string;
  prompt: string;
  voice: string;
  voiceKey: string;
  voiceRegion: string;
  maxTokens: number;
  temperature: number;
  apiKey: string;
  queueId: number;
  maxMessages: number;
}

const deleteFileSync = (path: string): void => {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.error("Erro ao deletar o arquivo:", error);
  }
};

const sanitizeName = (name: string): string => {
  let sanitized = name.split(" ")[0];
  sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
  return sanitized.substring(0, 60);
};

export const handleOpenAi = async (
  openAiSettings: IOpenAi,
  msg: proto.IWebMessageInfo,
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  mediaSent: Message | undefined,
  ticketTraking: TicketTraking
): Promise<void> => {
  try {
    // Validações iniciais mais robustas
    if (!openAiSettings) {
      console.error("OpenAiService: Configurações ausentes");
      return;
    }

    // Validação específica para cada campo obrigatório
    const requiredFields = ['name', 'apiKey', 'prompt'];
    const missingFields = requiredFields.filter(field => !openAiSettings[field]);
    
    if (missingFields.length > 0) {
      console.error("OpenAiService: Campos obrigatórios ausentes:", missingFields);
      return;
    }

    // REGRA PARA DESABILITAR O BOT PARA ALGUM CONTATO
    if (contact?.disableBot) {
      return;
    }

    const bodyMessage = getBodyMessage(msg);
    if (!bodyMessage) {
      console.log("OpenAiService: Mensagem vazia");
      return;
    }

    if (msg.messageStubType) {
      console.log("OpenAiService: Mensagem do tipo stub");
      return;
    }

    // Validação do ticket
    if (!ticket || !ticket.id) {
      console.error("OpenAiService: Ticket inválido");
      return;
    }

    const publicFolder: string = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "public",
      `company${ticket.companyId}`
    );

    let openai: OpenAI | any;
    const openAiIndex = sessionsOpenAi.findIndex(s => s.id === ticket.id);

    if (openAiIndex === -1) {
      console.log("OpenAiService: Criando nova sessão OpenAI");
      openai = new OpenAI({
        apiKey: openAiSettings.apiKey
      });
      openai.id = ticket.id;
      sessionsOpenAi.push(openai);
    } else {
      openai = sessionsOpenAi[openAiIndex];
    }

    // Validação da sessão OpenAI
    if (!openai) {
      console.error("OpenAiService: Falha ao criar sessão OpenAI");
      return;
    }

    const messages = await Message.findAll({
      where: { ticketId: ticket.id },
      order: [["createdAt", "ASC"]],
      limit: openAiSettings.maxMessages || 10
    });

    // Validação do nome do contato
    const contactName = contact?.name || "Amigo(a)";
    const sanitizedName = sanitizeName(contactName);

    const promptSystem = `Nas respostas utilize o nome ${sanitizedName} para identificar o cliente.\nSua resposta deve usar no máximo ${
      openAiSettings.maxTokens || 100
    } tokens e cuide para não truncar o final.\nSempre que possível, mencione o nome dele para ser mais personalizado o atendimento e mais educado. Quando a resposta requer uma transferência para o setor de atendimento, comece sua resposta com 'Ação: Transferir para o setor de atendimento'.\n
                ${openAiSettings.prompt}\n`;

    let messagesOpenAi = [];

    if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
      console.log("OpenAiService: Processando mensagem de texto");
      messagesOpenAi = [];
      messagesOpenAi.push({ role: "system", content: promptSystem });
      
      // Processamento das mensagens anteriores
      for (let i = 0; i < Math.min(openAiSettings.maxMessages || 10, messages.length); i++) {
        const message = messages[i];
        if (message.mediaType === "conversation" || message.mediaType === "extendedTextMessage") {
          if (message.fromMe) {
            messagesOpenAi.push({ role: "assistant", content: message.body });
          } else {
            messagesOpenAi.push({ role: "user", content: message.body });
          }
        }
      }
      
      messagesOpenAi.push({ role: "user", content: bodyMessage });

      try {
        const chat = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-1106",
          messages: messagesOpenAi,
          max_tokens: openAiSettings.maxTokens || 100,
          temperature: openAiSettings.temperature || 1
        });

        let response = chat.choices[0].message?.content;

        if (!response) {
          console.error("OpenAiService: Resposta vazia da OpenAI");
          return;
        }

        if (response.includes("Ação: Transferir para o setor de atendimento")) {
          console.log("OpenAiService: Transferindo para fila");
          await transferQueue(openAiSettings.queueId, ticket, contact);
          response = response.replace("Ação: Transferir para o setor de atendimento", "").trim();
        }

        if (openAiSettings.voice === "texto") {
          console.log("OpenAiService: Enviando resposta em texto");
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
            text: `\u200e ${response}`
          });
          await verifyMessage(sentMessage!, ticket, contact);
        } else {
          console.log("OpenAiService: Enviando resposta em áudio");
          const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
          await convertTextToSpeechAndSaveToFile(
            keepOnlySpecifiedChars(response),
            `${publicFolder}/${fileNameWithOutExtension}`,
            openAiSettings.voiceKey,
            openAiSettings.voiceRegion,
            openAiSettings.voice,
            "mp3"
          );

          try {
            const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
              audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
              mimetype: "audio/mpeg",
              ptt: true
            });
            await verifyMediaMessage(sendMessage!, ticket, contact, ticketTraking, false, false, wbot);
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
          } catch (error) {
            console.error(`Erro ao enviar áudio: ${error}`);
          }
        }
      } catch (error) {
        console.error("OpenAiService: Erro ao processar mensagem:", error);
      }
    } else if (msg.message?.audioMessage) {
      console.log(201, "OpenAiService");
      const mediaUrl = mediaSent!.mediaUrl!.split("/").pop();
      const file = fs.createReadStream(`${publicFolder}/${mediaUrl}`) as any;

      const transcription = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: file
      });

      messagesOpenAi = [];
      messagesOpenAi.push({ role: "system", content: promptSystem });
      for (
        let i = 0;
        i < Math.min(openAiSettings.maxMessages, messages.length);
        i++
      ) {
        const message = messages[i];
        if (
          message.mediaType === "conversation" ||
          message.mediaType === "extendedTextMessage"
        ) {
          console.log(238, "OpenAiService");

          if (message.fromMe) {
            messagesOpenAi.push({ role: "assistant", content: message.body });
          } else {
            messagesOpenAi.push({ role: "user", content: message.body });
          }
        }
      }
      messagesOpenAi.push({ role: "user", content: transcription.text });
      const chat = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: messagesOpenAi,
        max_tokens: openAiSettings.maxTokens,
        temperature: openAiSettings.temperature
      });
      let response = chat.choices[0].message?.content;

      if (response?.includes("Ação: Transferir para o setor de atendimento")) {
        await transferQueue(openAiSettings.queueId, ticket, contact);
        response = response
          .replace("Ação: Transferir para o setor de atendimento", "")
          .trim();
      }
      if (openAiSettings.voice === "texto") {
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: `\u200e ${response!}`
        });
        await verifyMessage(sentMessage!, ticket, contact);
      } else {
        const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
        convertTextToSpeechAndSaveToFile(
          keepOnlySpecifiedChars(response!),
          `${publicFolder}/${fileNameWithOutExtension}`,
          openAiSettings.voiceKey,
          openAiSettings.voiceRegion,
          openAiSettings.voice,
          "mp3"
        ).then(async () => {
          try {
            const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
              audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
              mimetype: "audio/mpeg",
              ptt: true
            });
            await verifyMediaMessage(
              sendMessage!,
              ticket,
              contact,
              ticketTraking,
              false,
              false,
              wbot
            );
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
            deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
          } catch (error) {
            console.log(`Erro para responder com audio: ${error}`);
          }
        });
      }
    }
    messagesOpenAi = [];
  } catch (error) {
    console.error("OpenAiService: Erro geral:", error);
  }
};
