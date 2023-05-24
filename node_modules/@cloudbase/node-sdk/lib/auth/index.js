"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils/utils");
const code_1 = require("../const/code");
const cloudbase_1 = require("../cloudbase");
const symbol_1 = require("../const/symbol");
const httpRequest_1 = __importDefault(require("../utils/httpRequest"));
const checkCustomUserIdRegex = /^[a-zA-Z0-9_\-#@~=*(){}[\]:.,<>+]{4,32}$/;
function validateUid(uid) {
    if (typeof uid !== 'string') {
        // console.log('debug:', { ...ERROR.INVALID_PARAM, message: 'uid must be a string' })
        throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: 'uid must be a string' }));
    }
    if (!checkCustomUserIdRegex.test(uid)) {
        throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: `Invalid uid: "${uid}"` }));
    }
}
function auth(cloudbase) {
    return {
        getUserInfo() {
            const { WX_OPENID, WX_APPID, TCB_UUID, TCB_CUSTOM_USER_ID, TCB_ISANONYMOUS_USER } = cloudbase_1.CloudBase.getCloudbaseContext();
            return {
                openId: WX_OPENID || '',
                appId: WX_APPID || '',
                uid: TCB_UUID || '',
                customUserId: TCB_CUSTOM_USER_ID || '',
                isAnonymous: TCB_ISANONYMOUS_USER === 'true' ? true : false
            };
        },
        getEndUserInfo(uid, opts) {
            const { WX_OPENID, WX_APPID, TCB_UUID, TCB_CUSTOM_USER_ID, TCB_ISANONYMOUS_USER } = cloudbase_1.CloudBase.getCloudbaseContext();
            const defaultUserInfo = {
                openId: WX_OPENID || '',
                appId: WX_APPID || '',
                uid: TCB_UUID || '',
                customUserId: TCB_CUSTOM_USER_ID || '',
                isAnonymous: TCB_ISANONYMOUS_USER === 'true' ? true : false
            };
            if (uid === undefined) {
                return {
                    userInfo: defaultUserInfo
                };
            }
            validateUid(uid);
            const params = {
                action: 'auth.getUserInfoForAdmin',
                uuid: uid
            };
            return httpRequest_1.default({
                config: cloudbase.config,
                params,
                method: 'post',
                opts,
                headers: {
                    'content-type': 'application/json'
                }
            }).then(res => {
                if (res.code) {
                    return res;
                }
                return {
                    userInfo: Object.assign({}, defaultUserInfo, res.data),
                    requestId: res.requestId
                };
            });
        },
        queryUserInfo(query, opts) {
            const { uid, platform, platformId } = query;
            const params = {
                action: 'auth.getUserInfoForAdmin',
                uuid: uid,
                platform,
                platformId
            };
            return httpRequest_1.default({
                config: cloudbase.config,
                params,
                method: 'post',
                opts,
                headers: {
                    'content-type': 'application/json'
                }
            }).then(res => {
                if (res.code) {
                    return res;
                }
                return {
                    userInfo: Object.assign({}, res.data),
                    requestId: res.requestId
                };
            });
        },
        async getAuthContext(context) {
            const { TCB_UUID, LOGINTYPE, QQ_OPENID, QQ_APPID } = cloudbase_1.CloudBase.getCloudbaseContext(context);
            const res = {
                uid: TCB_UUID,
                loginType: LOGINTYPE
            };
            if (LOGINTYPE === 'QQ-MINI') {
                res.appId = QQ_APPID;
                res.openId = QQ_OPENID;
            }
            return res;
        },
        getClientIP() {
            const { TCB_SOURCE_IP } = cloudbase_1.CloudBase.getCloudbaseContext();
            return TCB_SOURCE_IP || '';
        },
        createTicket: (uid, options = {}) => {
            validateUid(uid);
            const timestamp = new Date().getTime();
            const { TCB_ENV, SCF_NAMESPACE } = cloudbase_1.CloudBase.getCloudbaseContext();
            const { credentials } = cloudbase.config;
            const { env_id } = credentials;
            let { envName } = cloudbase.config;
            if (!envName) {
                throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: 'no env in config' }));
            }
            // 检查credentials 是否包含env
            if (!env_id) {
                throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: '当前私钥未包含env_id 信息， 请前往腾讯云云开发控制台，获取自定义登录最新私钥' }));
            }
            // 使用symbol时替换为环境变量内的env
            if (envName === symbol_1.SYMBOL_CURRENT_ENV) {
                envName = TCB_ENV || SCF_NAMESPACE;
            }
            // 检查 credentials env 和 init 指定env 是否一致
            if (env_id && env_id !== envName) {
                throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: '当前私钥所属环境与 init 指定环境不一致！' }));
            }
            const { refresh = 3600 * 1000, expire = timestamp + 7 * 24 * 60 * 60 * 1000 } = options;
            const token = jsonwebtoken_1.default.sign({
                alg: 'RS256',
                env: envName,
                iat: timestamp,
                exp: timestamp + 10 * 60 * 1000,
                uid,
                refresh,
                expire
            }, credentials.private_key, { algorithm: 'RS256' });
            return credentials.private_key_id + '/@@/' + token;
        }
    };
}
exports.auth = auth;
