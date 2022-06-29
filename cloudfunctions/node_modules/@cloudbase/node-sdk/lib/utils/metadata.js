"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
exports.kMetadataBaseUrl = 'http://metadata.tencentyun.com';
var kMetadataVersions;
(function (kMetadataVersions) {
    kMetadataVersions["v20170919"] = "2017-09-19";
    kMetadataVersions["v1.0"] = "1.0";
    kMetadataVersions["latest"] = "latest";
})(kMetadataVersions = exports.kMetadataVersions || (exports.kMetadataVersions = {}));
function isAppId(appIdStr) {
    return /^[1-9][0-9]{4,64}$/gim.test(appIdStr);
}
exports.isAppId = isAppId;
async function lookup(path, options = {}) {
    const url = `${exports.kMetadataBaseUrl}/${kMetadataVersions.latest}/${path}`;
    const resp = await axios_1.default.get(url, options);
    if (resp.status === 200) {
        return resp.data;
    }
    else {
        throw new Error(`[ERROR] GET ${url} status: ${resp.status}`);
    }
}
exports.lookup = lookup;
const metadataCache = {
    appId: undefined
};
/**
 * lookupAppId - 该方法主要用于判断是否在云上环境
 * @returns
 */
async function lookupAppId() {
    if (metadataCache.appId === undefined) {
        metadataCache.appId = '';
        try {
            // 只有首次会请求且要求快速返回，超时时间很短，DNS无法解析将会超时返回
            // 在云环境中，这个时间通常在 10ms 内，部分耗时长（30+ms）的情况是 DNS 解析耗时长（27+ms）
            const appId = await lookup('meta-data/app-id', { timeout: 30 });
            if (isAppId(appId)) {
                metadataCache.appId = appId;
            }
        }
        catch (e) {
            // ignore
        }
    }
    return metadataCache.appId || '';
}
exports.lookupAppId = lookupAppId;
