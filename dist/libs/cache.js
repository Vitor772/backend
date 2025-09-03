"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const ioredis_1 = __importDefault(require("ioredis"));
const hmac_sha512_1 = __importDefault(require("crypto-js/hmac-sha512"));
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const redis_1 = require("../config/redis");
class CacheSingleton {
    constructor(redisInstance) {
        this.redis = redisInstance;
        this.set = util_1.default.promisify(this.redis.set).bind(this.redis);
        this.get = util_1.default.promisify(this.redis.get).bind(this.redis);
        this.keys = util_1.default.promisify(this.redis.keys).bind(this.redis);
        this.del = util_1.default.promisify(this.redis.del).bind(this.redis);
    }
    static getInstance(redisInstance) {
        if (!CacheSingleton.instance) {
            CacheSingleton.instance = new CacheSingleton(redisInstance);
        }
        return CacheSingleton.instance;
    }
    static encryptParams(params) {
        const str = JSON.stringify(params);
        const key = enc_base64_1.default.stringify((0, hmac_sha512_1.default)(params, str));
        return key;
    }
    async set(key, value, option, optionValue) {
        const setPromisefy = util_1.default.promisify(this.redis.set).bind(this.redis);
        if (option !== undefined && optionValue !== undefined) {
            return setPromisefy(key, value, option, optionValue);
        }
        return setPromisefy(key, value);
    }
    async get(key) {
        const getPromisefy = util_1.default.promisify(this.redis.get).bind(this.redis);
        return getPromisefy(key);
    }
    async getKeys(pattern) {
        const getKeysPromisefy = util_1.default.promisify(this.redis.keys).bind(this.redis);
        return getKeysPromisefy(pattern);
    }
    async del(key) {
        const delPromisefy = util_1.default.promisify(this.redis.del).bind(this.redis);
        return delPromisefy(key);
    }
    async delFromPattern(pattern) {
        const all = await this.getKeys(pattern);
        await Promise.all(all.map(item => this.del(item)));
    }
    async setFromParams(key, params, value, option, optionValue) {
        const finalKey = `${key}:${CacheSingleton.encryptParams(params)}`;
        if (option !== undefined && optionValue !== undefined) {
            return this.set(finalKey, value, option, optionValue);
        }
        return this.set(finalKey, value);
    }
    async getFromParams(key, params) {
        const finalKey = `${key}:${CacheSingleton.encryptParams(params)}`;
        return this.get(finalKey);
    }
    async delFromParams(key, params) {
        const finalKey = `${key}:${CacheSingleton.encryptParams(params)}`;
        return this.del(finalKey);
    }
    getRedisInstance() {
        return this.redis;
    }
}
const redisInstance = new ioredis_1.default(redis_1.REDIS_URI_CONNECTION);
exports.default = CacheSingleton.getInstance(redisInstance);
