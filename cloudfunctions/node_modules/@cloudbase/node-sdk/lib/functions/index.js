"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpRequest_1 = __importDefault(require("../utils/httpRequest"));
const utils_1 = require("../utils/utils");
const code_1 = require("../const/code");
const cloudbase_1 = require("../cloudbase");
/**
 * 调用云函数
 * @param {String} name  函数名
 * @param {Object} functionParam 函数参数
 * @return {Promise}
 */
async function callFunction(cloudbase, { name, qualifier, data }, opts) {
    const { TCB_ROUTE_KEY } = cloudbase_1.CloudBase.getCloudbaseContext();
    let transformData;
    try {
        transformData = data ? JSON.stringify(data) : '';
    }
    catch (e) {
        throw utils_1.E(Object.assign({}, e, { code: code_1.ERROR.INVALID_PARAM.code, message: '对象出现了循环引用' }));
    }
    if (!name) {
        throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: '函数名不能为空' }));
    }
    const params = {
        action: 'functions.invokeFunction',
        function_name: name,
        qualifier: qualifier,
        // async: async,
        request_data: transformData
    };
    return httpRequest_1.default({
        config: cloudbase.config,
        params,
        method: 'post',
        opts,
        headers: Object.assign({ 'content-type': 'application/json' }, (TCB_ROUTE_KEY ? { 'X-Tcb-Route-Key': TCB_ROUTE_KEY } : {}))
    }).then(res => {
        if (res.code) {
            return res;
        }
        let result;
        try {
            result = JSON.parse(res.data.response_data);
        }
        catch (e) {
            result = res.data.response_data;
        }
        return {
            result,
            requestId: res.requestId
        };
    });
}
exports.callFunction = callFunction;
