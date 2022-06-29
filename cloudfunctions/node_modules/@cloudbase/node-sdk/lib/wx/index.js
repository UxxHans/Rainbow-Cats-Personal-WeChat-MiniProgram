"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpRequest_1 = __importDefault(require("../utils/httpRequest"));
const utils_1 = require("../utils/utils");
const code_1 = require("../const/code");
function validateCrossAccount(config, opts = {}) {
    let getCrossAccountInfo = opts.getCrossAccountInfo || config.getCrossAccountInfo;
    if (getCrossAccountInfo) {
        throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: 'invalid config: getCrossAccountInfo' }));
    }
}
async function callWxOpenApi(cloudbase, { apiName, apiOptions, cgiName, requestData }, opts) {
    let transformRequestData;
    try {
        transformRequestData = requestData ? JSON.stringify(requestData) : '';
    }
    catch (e) {
        throw utils_1.E(Object.assign({}, e, { code: code_1.ERROR.INVALID_PARAM.code, message: '对象出现了循环引用' }));
    }
    validateCrossAccount(cloudbase.config, opts);
    const params = {
        action: 'wx.api',
        apiName,
        apiOptions,
        cgiName,
        requestData: transformRequestData
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
        let result;
        try {
            result = JSON.parse(res.data.responseData);
        }
        catch (e) {
            result = res.data.responseData;
        }
        return {
            result,
            requestId: res.requestId
        };
        // }
    });
}
exports.callWxOpenApi = callWxOpenApi;
/**
 * 调用wxopenAPi
 * @param {String} apiName  接口名
 * @param {Buffer} requestData
 * @return {Promise} 正常内容为buffer，报错为json {code:'', message:'', resquestId:''}
 */
async function callCompatibleWxOpenApi(cloudbase, { apiName, apiOptions, cgiName, requestData }, opts) {
    validateCrossAccount(cloudbase.config, opts);
    const params = {
        action: 'wx.openApi',
        apiName,
        apiOptions,
        cgiName,
        requestData
    };
    return httpRequest_1.default({
        config: cloudbase.config,
        method: 'post',
        headers: { 'content-type': 'multipart/form-data' },
        params,
        isFormData: true,
        opts
    }).then(res => res);
}
exports.callCompatibleWxOpenApi = callCompatibleWxOpenApi;
/**
 * wx.wxPayApi 微信支付用
 * @param {String} apiName  接口名
 * @param {Buffer} requestData
 * @return {Promise} 正常内容为buffer，报错为json {code:'', message:'', resquestId:''}
 */
async function callWxPayApi(cloudbase, { apiName, apiOptions, cgiName, requestData }, opts) {
    validateCrossAccount(cloudbase.config, opts);
    const params = {
        action: 'wx.wxPayApi',
        apiName,
        apiOptions,
        cgiName,
        requestData
    };
    return httpRequest_1.default({
        config: cloudbase.config,
        method: 'post',
        headers: { 'content-type': 'multipart/form-data' },
        params,
        isFormData: true,
        opts
    });
}
exports.callWxPayApi = callWxPayApi;
/**
 * wx.wxCallContainerApi
 * @param {String} apiName  接口名
 * @param {Buffer} requestData
 * @return {Promise} 正常内容为buffer，报错为json {code:'', message:'', resquestId:''}
 */
async function wxCallContainerApi(cloudbase, { apiName, apiOptions, cgiName, requestData }, opts) {
    validateCrossAccount(cloudbase.config, opts);
    const params = {
        action: 'wx.wxCallContainerApi',
        apiName,
        apiOptions,
        cgiName,
        requestData
    };
    return httpRequest_1.default({
        config: cloudbase.config,
        method: 'post',
        headers: { 'content-type': 'multipart/form-data' },
        params,
        isFormData: true,
        opts
    });
}
exports.wxCallContainerApi = wxCallContainerApi;
