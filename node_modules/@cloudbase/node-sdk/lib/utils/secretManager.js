"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
const metadata_1 = require("./metadata");
/**
 * 容器托管内的密钥管理器
 */
class SecretManager {
    constructor() {
        this.TMP_SECRET_URL = `${metadata_1.kMetadataBaseUrl}/meta-data/cam/security-credentials/TCB_QcsRole`;
        this.tmpSecret = null;
    }
    /* istanbul ignore next */
    async getTmpSecret() {
        if (this.tmpSecret) {
            const now = new Date().getTime();
            const expire = this.tmpSecret.expire * 1000;
            const oneHour = 3600 * 1000;
            if (now < expire - oneHour) {
                // 密钥没过期
                return this.tmpSecret;
            }
            else {
                // 密钥过期
                return this.fetchTmpSecret();
            }
        }
        else {
            return this.fetchTmpSecret();
        }
    }
    /* istanbul ignore next */
    async fetchTmpSecret() {
        const body = await this.get(this.TMP_SECRET_URL);
        const payload = JSON.parse(body);
        this.tmpSecret = {
            id: payload.TmpSecretId,
            key: payload.TmpSecretKey,
            expire: payload.ExpiredTime,
            token: payload.Token
        };
        return this.tmpSecret;
    }
    /* istanbul ignore next */
    get(url) {
        return new Promise((resolve, reject) => {
            request_1.default.get(url, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(body);
                }
            });
        });
    }
}
exports.default = SecretManager;
