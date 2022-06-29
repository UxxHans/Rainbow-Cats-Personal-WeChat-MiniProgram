"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const utils_1 = require("./utils");
const utils_lang_1 = require("./utils.lang");
const keyvalue_1 = require("./keyvalue");
const url_1 = require("url");
const debug = require('util').debuglog('@cloudbase/signature');
const isStream = require('is-stream');
exports.signedParamsSeparator = ';';
const HOST_KEY = 'host';
const CONTENT_TYPE_KEY = 'content-type';
var MIME;
(function (MIME) {
    MIME["MULTIPART_FORM_DATA"] = "multipart/form-data";
    MIME["APPLICATION_JSON"] = "application/json";
})(MIME || (MIME = {}));
class Signer {
    constructor(credential, service, options = {}) {
        this.credential = credential;
        this.service = service;
        this.algorithm = 'TC3-HMAC-SHA256';
        this.options = options;
    }
    static camSafeUrlEncode(str) {
        return encodeURIComponent(str)
            .replace(/!/g, '%21')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    }
    /**
     * 将一个对象处理成 KeyValue 形式，嵌套的对象将会被处理成字符串，Key转换成小写字母
     * @param {Object}  obj - 待处理的对象
     * @param {Object}  options
     * @param {Boolean} options.enableBuffer
     */
    static formatKeyAndValue(obj, options = {}) {
        if (!utils_lang_1.isPlainObject(obj)) {
            return obj;
        }
        // enableValueToLowerCase：头部字段，要求小写，其他数据不需要小写，所以这里避免转小写
        const { multipart, enableValueToLowerCase = false, selectedKeys, filter } = options;
        const kv = {};
        Object.keys(obj || {}).forEach(key => {
            // NOTE: 客户端类型在服务端可能会丢失
            const lowercaseKey = Signer.camSafeUrlEncode(key.toLowerCase().trim());
            // 过滤 Key，服务端接收到的数据，可能含有未签名的 Key，通常是签名的时候被过滤掉的流，数据量可能会比较大
            // 所以这里提供一个过滤的判断，避免不必要的计算
            // istanbul ignore next
            if (Array.isArray(selectedKeys) && !selectedKeys.includes(lowercaseKey)) {
                return;
            }
            // istanbul ignore next
            if (typeof filter === 'function') {
                if (filter(key, obj[key], options)) {
                    return;
                }
            }
            // istanbul ignore else
            if (key && obj[key] !== undefined) {
                if (lowercaseKey === CONTENT_TYPE_KEY) {
                    // multipart/form-data; boundary=???
                    if (obj[key].startsWith(MIME.MULTIPART_FORM_DATA)) {
                        kv[lowercaseKey] = MIME.MULTIPART_FORM_DATA;
                    }
                    else {
                        kv[lowercaseKey] = obj[key];
                    }
                    return;
                }
                if (isStream(obj[key])) {
                    // 这里如果是个文件流，在发送的时候可以识别
                    // 服务端接收到数据之后传到这里判断不出来的
                    // 所以会进入后边的逻辑
                    return;
                }
                else if (utils_1.isNodeEnv() && Buffer.isBuffer(obj[key])) {
                    if (multipart) {
                        kv[lowercaseKey] = obj[key];
                    }
                    else {
                        kv[lowercaseKey] = enableValueToLowerCase
                            ? utils_1.stringify(obj[key]).trim().toLowerCase()
                            : utils_1.stringify(obj[key]).trim();
                    }
                }
                else {
                    kv[lowercaseKey] = enableValueToLowerCase
                        ? utils_1.stringify(obj[key]).trim().toLowerCase()
                        : utils_1.stringify(obj[key]).trim();
                }
            }
        });
        return kv;
    }
    static calcParamsHash(params, keys = null, options = {}) {
        debug(params, 'calcParamsHash');
        if (utils_lang_1.isString(params)) {
            return utils_1.sha256hash(params);
        }
        // 只关心业务参数，不关心以什么类型的 Content-Type 传递的
        // 所以 application/json multipart/form-data 计算方式是相同的
        keys = keys || keyvalue_1.SortedKeyValue.kv(params).keys();
        const hash = crypto.createHash('sha256');
        for (const key of keys) {
            // istanbul ignore next
            if (!params[key]) {
                continue;
            }
            // istanbul ignore next
            if (isStream(params[key])) {
                continue;
            }
            // string && buffer
            hash.update(`&${key}=`);
            hash.update(params[key]);
            hash.update('\r\n');
        }
        return hash.digest(options.encoding || 'hex');
    }
    /**
     * 计算签名信息
     * @param {string} method       - Http Verb：GET/get POST/post 区分大小写
     * @param {string} url          - 地址：http://abc.org/api/v1?a=1&b=2
     * @param {Object} headers      - 需要签名的头部字段
     * @param {string} params       - 请求参数
     * @param {number} [timestamp]  - 签名时间戳
     * @param {object} [options]    - 可选参数
     */
    tc3sign(method, url, headers, params, timestamp, options = {}) {
        timestamp = timestamp || utils_1.second();
        const urlInfo = url_1.parse(url);
        const formatedHeaders = Signer.formatKeyAndValue(headers, {
            enableValueToLowerCase: true
        });
        const headerKV = keyvalue_1.SortedKeyValue.kv(formatedHeaders);
        const signedHeaders = headerKV.keys();
        const canonicalHeaders = headerKV.toString(':', '\n') + '\n';
        const { enableHostCheck = true, enableContentTypeCheck = true } = options;
        if (enableHostCheck && headerKV.get(HOST_KEY) !== urlInfo.host) {
            throw new TypeError(`host:${urlInfo.host} in url must be equals to host:${headerKV.get('host')} in headers`);
        }
        if (enableContentTypeCheck && !headerKV.get(CONTENT_TYPE_KEY)) {
            throw new TypeError(`${CONTENT_TYPE_KEY} field must in headers`);
        }
        const multipart = headerKV.get(CONTENT_TYPE_KEY).startsWith(MIME.MULTIPART_FORM_DATA);
        const formatedParams = method.toUpperCase() === 'GET' ? '' : Signer.formatKeyAndValue(params, {
            multipart
        });
        const paramKV = keyvalue_1.SortedKeyValue.kv(formatedParams);
        const signedParams = paramKV.keys();
        const hashedPayload = Signer.calcParamsHash(formatedParams, null);
        const signedUrl = url.replace(/^https?:/, '').split('?')[0];
        const canonicalRequest = `${method}\n${signedUrl}\n${urlInfo.query || ''}\n${canonicalHeaders}\n${signedHeaders.join(';')}\n${hashedPayload}`;
        debug(canonicalRequest, 'canonicalRequest\n\n');
        const date = utils_1.formateDate(timestamp);
        const service = this.service;
        const algorithm = this.algorithm;
        const credentialScope = `${date}/${service}/tc3_request`;
        const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${utils_1.sha256hash(canonicalRequest)}`;
        debug(stringToSign, 'stringToSign\n\n');
        const secretDate = utils_1.sha256hmac(date, `TC3${this.credential.secretKey}`);
        const secretService = utils_1.sha256hmac(service, secretDate);
        const secretSigning = utils_1.sha256hmac('tc3_request', secretService);
        const signature = utils_1.sha256hmac(stringToSign, secretSigning, 'hex');
        debug(secretDate.toString('hex'), 'secretDate');
        debug(secretService.toString('hex'), 'secretService');
        debug(secretSigning.toString('hex'), 'secretSigning');
        debug(signature, 'signature');
        const { withSignedParams = false } = options;
        return {
            // 需注意该字段长度
            // https://stackoverflow.com/questions/686217/maximum-on-http-header-values
            // https://www.tutorialspoint.com/What-is-the-maximum-size-of-HTTP-header-values
            authorization: `${algorithm} Credential=${this.credential.secretId}/${credentialScope},${withSignedParams ? ` SignedParams=${signedParams.join(';')},` : ''} SignedHeaders=${signedHeaders.join(';')}, Signature=${signature}`,
            signedParams,
            signedHeaders,
            signature,
            timestamp,
            multipart
        };
    }
}
exports.Signer = Signer;
