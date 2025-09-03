"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const User_1 = __importDefault(require("../models/User"));
const Setting_1 = __importDefault(require("../models/Setting"));
const Contact_1 = __importDefault(require("../models/Contact"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const ContactCustomField_1 = __importDefault(require("../models/ContactCustomField"));
const Message_1 = __importDefault(require("../models/Message"));
const Queue_1 = __importDefault(require("../models/Queue"));
const WhatsappQueue_1 = __importDefault(require("../models/WhatsappQueue"));
const UserQueue_1 = __importDefault(require("../models/UserQueue"));
const Company_1 = __importDefault(require("../models/Company"));
const Plan_1 = __importDefault(require("../models/Plan"));
const TicketNote_1 = __importDefault(require("../models/TicketNote"));
const QuickMessage_1 = __importDefault(require("../models/QuickMessage"));
const Help_1 = __importDefault(require("../models/Help"));
const TicketTraking_1 = __importDefault(require("../models/TicketTraking"));
const UserRating_1 = __importDefault(require("../models/UserRating"));
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Tag_1 = __importDefault(require("../models/Tag"));
const TicketTag_1 = __importDefault(require("../models/TicketTag"));
const ContactList_1 = __importDefault(require("../models/ContactList"));
const ContactListItem_1 = __importDefault(require("../models/ContactListItem"));
const Campaign_1 = __importDefault(require("../models/Campaign"));
const CampaignSetting_1 = __importDefault(require("../models/CampaignSetting"));
const Baileys_1 = __importDefault(require("../models/Baileys"));
const CampaignShipping_1 = __importDefault(require("../models/CampaignShipping"));
const Announcement_1 = __importDefault(require("../models/Announcement"));
const Chat_1 = __importDefault(require("../models/Chat"));
const ChatUser_1 = __importDefault(require("../models/ChatUser"));
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const Chatbot_1 = __importDefault(require("../models/Chatbot"));
const DialogChatBots_1 = __importDefault(require("../models/DialogChatBots"));
const QueueIntegrations_1 = __importDefault(require("../models/QueueIntegrations"));
const Invoices_1 = __importDefault(require("../models/Invoices"));
const Subscriptions_1 = __importDefault(require("../models/Subscriptions"));
const ApiUsages_1 = __importDefault(require("../models/ApiUsages"));
const Files_1 = __importDefault(require("../models/Files"));
const FilesOptions_1 = __importDefault(require("../models/FilesOptions"));
const ContactTag_1 = __importDefault(require("../models/ContactTag"));
const CompaniesSettings_1 = __importDefault(require("../models/CompaniesSettings"));
const LogTicket_1 = __importDefault(require("../models/LogTicket"));
const Prompt_1 = __importDefault(require("../models/Prompt"));
const Partner_1 = __importDefault(require("../models/Partner"));
const ContactWallet_1 = __importDefault(require("../models/ContactWallet"));
const ScheduledMessages_1 = __importDefault(require("../models/ScheduledMessages"));
const ScheduledMessagesEnvio_1 = __importDefault(require("../models/ScheduledMessagesEnvio"));
const Versions_1 = __importDefault(require("../models/Versions"));
const FlowDefault_1 = require("../models/FlowDefault");
const FlowBuilder_1 = require("../models/FlowBuilder");
const FlowAudio_1 = require("../models/FlowAudio");
const FlowCampaign_1 = require("../models/FlowCampaign");
const FlowImg_1 = require("../models/FlowImg");
const Webhook_1 = require("../models/Webhook");
// eslint-disable-next-line
const dbConfig = require("../config/database");
const sequelize = new sequelize_typescript_1.Sequelize(dbConfig);
const models = [
    Company_1.default,
    User_1.default,
    Contact_1.default,
    ContactTag_1.default,
    Ticket_1.default,
    Message_1.default,
    Whatsapp_1.default,
    ContactCustomField_1.default,
    Setting_1.default,
    Queue_1.default,
    WhatsappQueue_1.default,
    UserQueue_1.default,
    Plan_1.default,
    TicketNote_1.default,
    QuickMessage_1.default,
    Help_1.default,
    TicketTraking_1.default,
    UserRating_1.default,
    Schedule_1.default,
    Tag_1.default,
    TicketTag_1.default,
    ContactList_1.default,
    ContactListItem_1.default,
    Campaign_1.default,
    CampaignSetting_1.default,
    Baileys_1.default,
    CampaignShipping_1.default,
    Announcement_1.default,
    Chat_1.default,
    ChatUser_1.default,
    ChatMessage_1.default,
    Chatbot_1.default,
    DialogChatBots_1.default,
    QueueIntegrations_1.default,
    Invoices_1.default,
    Subscriptions_1.default,
    ApiUsages_1.default,
    Files_1.default,
    FilesOptions_1.default,
    CompaniesSettings_1.default,
    LogTicket_1.default,
    Prompt_1.default,
    Partner_1.default,
    ContactWallet_1.default,
    ScheduledMessages_1.default,
    ScheduledMessagesEnvio_1.default,
    Versions_1.default,
    FlowDefault_1.FlowDefaultModel,
    FlowBuilder_1.FlowBuilderModel,
    FlowAudio_1.FlowAudioModel,
    FlowCampaign_1.FlowCampaignModel,
    FlowImg_1.FlowImgModel,
    Webhook_1.WebhookModel
];
sequelize.addModels(models);
exports.default = sequelize;
