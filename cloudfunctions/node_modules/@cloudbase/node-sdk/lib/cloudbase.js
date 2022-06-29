"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("@cloudbase/database");
const functions_1 = require("./functions");
const auth_1 = require("./auth");
const wx_1 = require("./wx");
const storage_1 = require("./storage");
const analytics_1 = require("./analytics");
const dbRequest_1 = require("./utils/dbRequest");
const log_1 = require("./log");
const code_1 = require("./const/code");
const utils_1 = require("./utils/utils");
const axios_1 = __importDefault(require("axios"));
class CloudBase {
    static parseContext(context) {
        if (typeof context !== 'object') {
            throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_CONTEXT, { message: 'context 必须为对象类型' }));
        }
        let { memory_limit_in_mb, time_limit_in_ms, request_id, environ, function_version, namespace, function_name, environment } = context;
        let parseResult = {};
        try {
            parseResult.memoryLimitInMb = memory_limit_in_mb;
            parseResult.timeLimitIns = time_limit_in_ms;
            parseResult.requestId = request_id;
            parseResult.functionVersion = function_version;
            parseResult.namespace = namespace;
            parseResult.functionName = function_name;
            // 存在environment 为新架构 上新字段 JSON序列化字符串
            if (environment) {
                parseResult.environment = JSON.parse(environment);
                return parseResult;
            }
            // 不存在environment 则为老字段，老架构上存在bug，无法识别value含特殊字符(若允许特殊字符，影响解析，这里特殊处理)
            const parseEnviron = environ.split(';');
            let parseEnvironObj = {};
            for (let i in parseEnviron) {
                // value含分号影响切割，未找到= 均忽略
                if (parseEnviron[i].indexOf('=') >= 0) {
                    const equalIndex = parseEnviron[i].indexOf('=');
                    const key = parseEnviron[i].slice(0, equalIndex);
                    let value = parseEnviron[i].slice(equalIndex + 1);
                    // value 含, 为数组
                    if (value.indexOf(',') >= 0) {
                        value = value.split(',');
                    }
                    parseEnvironObj[key] = value;
                }
            }
            parseResult.environ = parseEnvironObj;
        }
        catch (err) {
            throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_CONTEXT));
        }
        CloudBase.scfContext = parseResult;
        return parseResult;
    }
    /**
     * 获取当前函数内的所有环境变量(作为获取变量的统一方法，取值来源process.env 和 context)
     */
    static getCloudbaseContext(context) {
        // WX_CONTEXT_ENV  WX_APPID WX_OPENID WX_UNIONID WX_API_TOKEN
        // TCB_CONTEXT_ENV TCB_ENV TCB_SEQID TRIGGER_SRC LOGINTYPE QQ_OPENID QQ_APPID TCB_UUID TCB_ISANONYMOUS_USER TCB_SESSIONTOKEN TCB_CUSTOM_USER_ID TCB_SOURCE_IP TCB_SOURCE TCB_ROUTE_KEY TCB_HTTP_CONTEXT TCB_CONTEXT_CNFG
        // 解析process.env
        const { TENCENTCLOUD_RUNENV, SCF_NAMESPACE, TCB_CONTEXT_KEYS, TENCENTCLOUD_SECRETID, TENCENTCLOUD_SECRETKEY, TENCENTCLOUD_SESSIONTOKEN, TRIGGER_SRC, WX_CONTEXT_KEYS, WX_TRIGGER_API_TOKEN_V0, WX_CLIENTIP, WX_CLIENTIPV6, _SCF_TCB_LOG, TCB_CONTEXT_CNFG, LOGINTYPE } = process.env;
        let contextEnv = {};
        if (context) {
            const { environment, environ } = CloudBase.parseContext(context);
            contextEnv = environment || environ || {};
        }
        // 从TCB_CONTEXT_KEYS 和 WX_CONTEXT_KEYS中解析环境变量 取值优先级为 context > process.env
        const tcb_context_keys = contextEnv.TCB_CONTEXT_KEYS || TCB_CONTEXT_KEYS;
        const wx_context_keys = contextEnv.WX_CONTEXT_KEYS || WX_CONTEXT_KEYS;
        let rawContext = {
            TENCENTCLOUD_RUNENV,
            SCF_NAMESPACE,
            TCB_CONTEXT_KEYS,
            TENCENTCLOUD_SECRETID,
            TENCENTCLOUD_SECRETKEY,
            TENCENTCLOUD_SESSIONTOKEN,
            TRIGGER_SRC,
            WX_TRIGGER_API_TOKEN_V0,
            WX_CLIENTIP,
            WX_CLIENTIPV6,
            WX_CONTEXT_KEYS,
            _SCF_TCB_LOG,
            TCB_CONTEXT_CNFG,
            LOGINTYPE
        };
        // 遍历keys
        if (tcb_context_keys) {
            try {
                const tcbKeysList = tcb_context_keys.split(',');
                for (let item of tcbKeysList) {
                    rawContext[item] = contextEnv[item] || process.env[item];
                }
            }
            catch (e) { }
        }
        if (wx_context_keys) {
            try {
                const wxKeysList = wx_context_keys.split(',');
                for (let item of wxKeysList) {
                    rawContext[item] = contextEnv[item] || process.env[item];
                }
            }
            catch (e) { }
        }
        rawContext = Object.assign({}, rawContext, contextEnv);
        let finalContext = {};
        for (let key in rawContext) {
            if (rawContext[key] !== undefined) {
                finalContext[key] = rawContext[key];
            }
        }
        return finalContext;
    }
    constructor(config) {
        this.init(config);
    }
    init(config = {}) {
        let { debug, secretId, secretKey, sessionToken, env, timeout, headers = {}, throwOnCode } = config, restConfig = __rest(config, ["debug", "secretId", "secretKey", "sessionToken", "env", "timeout", "headers", "throwOnCode"]);
        if ((secretId && !secretKey) || (!secretId && secretKey)) {
            throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: 'secretId and secretKey must be a pair' }));
        }
        const newConfig = Object.assign({}, restConfig, { debug: !!debug, secretId: secretId, secretKey: secretKey, sessionToken: sessionToken, envName: env, headers: Object.assign({}, headers), timeout: timeout || 15000, throwOnCode: throwOnCode !== undefined ? throwOnCode : true });
        this.config = newConfig;
        this.extensionMap = {};
    }
    registerExtension(ext) {
        this.extensionMap[ext.name] = ext;
    }
    async invokeExtension(name, opts) {
        const ext = this.extensionMap[name];
        if (!ext) {
            throw Error(`扩展${name} 必须先注册`);
        }
        console.log(opts);
        return ext.invoke(opts, this);
    }
    database(dbConfig = {}) {
        database_1.Db.reqClass = dbRequest_1.DBRequest;
        // 兼容方法预处理
        if (Object.prototype.toString.call(dbConfig).slice(8, -1) !== 'Object') {
            throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: 'dbConfig must be an object' }));
        }
        if (dbConfig && dbConfig.env) {
            // env变量名转换
            dbConfig.envName = dbConfig.env;
            delete dbConfig.env;
        }
        return new database_1.Db(Object.assign({}, this.config, dbConfig));
    }
    /**
     * 调用云函数
     *
     * @param param0
     * @param opts
     */
    callFunction(callFunctionOptions, opts) {
        return functions_1.callFunction(this, callFunctionOptions, opts);
    }
    auth() {
        return auth_1.auth(this);
    }
    /**
     * openapi调用
     *
     * @param param0
     * @param opts
     */
    callWxOpenApi(wxOpenApiOptions, opts) {
        return wx_1.callWxOpenApi(this, wxOpenApiOptions, opts);
    }
    /**
     * wxpayapi调用
     *
     * @param param0
     * @param opts
     */
    callWxPayApi(wxOpenApiOptions, opts) {
        return wx_1.callWxPayApi(this, wxOpenApiOptions, opts);
    }
    /**
     * wxpayapi调用
     *
     * @param param0
     * @param opts
     */
    wxCallContainerApi(wxOpenApiOptions, opts) {
        return wx_1.wxCallContainerApi(this, wxOpenApiOptions, opts);
    }
    /**
     * 微信云调用
     *
     * @param param0
     * @param opts
     */
    callCompatibleWxOpenApi(wxOpenApiOptions, opts) {
        return wx_1.callCompatibleWxOpenApi(this, wxOpenApiOptions, opts);
    }
    /**
     * 上传文件
     *
     * @param param0
     * @param opts
     */
    uploadFile({ cloudPath, fileContent }, opts) {
        return storage_1.uploadFile(this, { cloudPath, fileContent }, opts);
    }
    /**
     * 删除文件
     *
     * @param param0
     * @param opts
     */
    deleteFile({ fileList }, opts) {
        return storage_1.deleteFile(this, { fileList }, opts);
    }
    /**
     * 获取临时连接
     *
     * @param param0
     * @param opts
     */
    getTempFileURL({ fileList }, opts) {
        return storage_1.getTempFileURL(this, { fileList }, opts);
    }
    /**
     * 下载文件
     *
     * @param params
     * @param opts
     */
    downloadFile(params, opts) {
        return storage_1.downloadFile(this, params, opts);
    }
    /**
     * 获取上传元数据
     *
     * @param param0
     * @param opts
     */
    getUploadMetadata({ cloudPath }, opts) {
        return storage_1.getUploadMetadata(this, { cloudPath }, opts);
    }
    getFileAuthority({ fileList }, opts) {
        return storage_1.getFileAuthority(this, { fileList }, opts);
    }
    /**
     * 获取logger
     *
     */
    logger() {
        if (!this.clsLogger) {
            this.clsLogger = log_1.logger();
        }
        return this.clsLogger;
    }
    analytics(reportData) {
        return analytics_1.analytics(this, reportData);
    }
    // shim for tcb extension ci
    get requestClient() {
        return {
            get: axios_1.default,
            post: axios_1.default,
            put: axios_1.default,
            delete: axios_1.default
        };
    }
}
exports.CloudBase = CloudBase;
