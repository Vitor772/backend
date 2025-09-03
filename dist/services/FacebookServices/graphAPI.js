"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeApplication = exports.getAccessTokenFromPage = exports.getSubscribedApps = exports.unsubscribeApp = exports.subscribeApp = exports.profilePsid = exports.getPageProfile = exports.getProfile = exports.genText = exports.sendAttachment = exports.sendAttachmentFromUrl = exports.sendText = exports.showTypingIndicator = exports.markSeen = exports.getAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = require("fs");
const logger_1 = __importDefault(require("../../utils/logger"));
const apiBase = (token) => axios_1.default.create({
    baseURL: "https://graph.facebook.com/v20.0/",
    params: {
        access_token: token
    }
});
const getAccessToken = async () => {
    const { data } = await axios_1.default.get("https://graph.facebook.com/v20.0/oauth/access_token", {
        params: {
            client_id: "2813216208828642",
            client_secret: "8233912aeade366dd8e2ebef6be256b6",
            grant_type: "client_credentials"
        }
    });
    return data.access_token;
};
exports.getAccessToken = getAccessToken;
const markSeen = async (id, token) => {
    await apiBase(token).post(`${id}/messages`, {
        recipient: { id },
        sender_action: "mark_seen"
    });
};
exports.markSeen = markSeen;
const showTypingIndicator = async (id, token, action) => {
    try {
        const { data } = await apiBase(token).post("me/messages", {
            recipient: { id },
            sender_action: action
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
};
exports.showTypingIndicator = showTypingIndicator;
const sendText = async (id, text, token) => {
    try {
        const { data } = await apiBase(token).post("me/messages", {
            recipient: { id },
            message: { text: `${text}` }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendText = sendText;
const sendAttachmentFromUrl = async (id, url, type, token) => {
    try {
        const { data } = await apiBase(token).post("me/messages", {
            recipient: { id },
            message: {
                attachment: {
                    type,
                    payload: { url }
                }
            }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendAttachmentFromUrl = sendAttachmentFromUrl;
const sendAttachment = async (id, file, type, token) => {
    const formData = new form_data_1.default();
    formData.append("recipient", JSON.stringify({ id }));
    formData.append("message", JSON.stringify({
        attachment: {
            type,
            payload: { is_reusable: true }
        }
    }));
    const fileReaderStream = (0, fs_1.createReadStream)(file.path);
    formData.append("filedata", fileReaderStream);
    try {
        await apiBase(token).post("me/messages", formData, {
            headers: { ...formData.getHeaders() }
        });
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.sendAttachment = sendAttachment;
const genText = (text) => {
    return { text };
};
exports.genText = genText;
const getProfile = async (id, token) => {
    try {
        const { data } = await apiBase(token).get(id);
        return data;
    }
    catch (error) {
        console.log(error);
        throw new Error("ERR_FETCHING_FB_USER_PROFILE_2");
    }
};
exports.getProfile = getProfile;
const getPageProfile = async (id, token) => {
    try {
        const { data } = await apiBase(token).get(`${id}/accounts?fields=name,access_token,instagram_business_account{id,username,profile_picture_url,name}`);
        return data;
    }
    catch (error) {
        console.log(error);
        throw new Error("ERR_FETCHING_FB_PAGES");
    }
};
exports.getPageProfile = getPageProfile;
const profilePsid = async (id, token) => {
    try {
        const { data } = await apiBase(token).get(`${id}`);
        return data;
    }
    catch (error) {
        console.log(error);
        await (0, exports.getProfile)(id, token);
    }
};
exports.profilePsid = profilePsid;
const subscribeApp = async (id, token) => {
    try {
        const { data } = await apiBase(token).post(`${id}/subscribed_apps`, {
            subscribed_fields: [
                "messages",
                "messaging_postbacks",
                "message_deliveries",
                "message_reads",
                "message_echoes"
            ]
        });
        return data;
    }
    catch (error) {
        console.log(error);
        throw new Error("ERR_SUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
    }
};
exports.subscribeApp = subscribeApp;
const unsubscribeApp = async (id, token) => {
    try {
        const { data } = await apiBase(token).delete(`${id}/subscribed_apps`);
        return data;
    }
    catch (error) {
        throw new Error("ERR_UNSUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
    }
};
exports.unsubscribeApp = unsubscribeApp;
const getSubscribedApps = async (id, token) => {
    try {
        const { data } = await apiBase(token).get(`${id}/subscribed_apps`);
        return data;
    }
    catch (error) {
        throw new Error("ERR_GETTING_SUBSCRIBED_APPS");
    }
};
exports.getSubscribedApps = getSubscribedApps;
const getAccessTokenFromPage = async (token) => {
    try {
        if (!token)
            throw new Error("ERR_FETCHING_FB_USER_TOKEN");
        const { data } = await axios_1.default.get("https://graph.facebook.com/v20.0/oauth/access_token", {
            params: {
                client_id: "2813216208828642",
                client_secret: "8233912aeade366dd8e2ebef6be256b6",
                grant_type: "fb_exchange_token",
                fb_exchange_token: token
            }
        });
        return data.access_token;
    }
    catch (error) {
        console.log(error);
        throw new Error("ERR_FETCHING_FB_USER_TOKEN");
    }
};
exports.getAccessTokenFromPage = getAccessTokenFromPage;
const removeApplication = async (id, token) => {
    try {
        await apiBase(token).delete(`${id}/permissions`);
    }
    catch (error) {
        logger_1.default.error("ERR_REMOVING_APP_FROM_PAGE");
    }
};
exports.removeApplication = removeApplication;
