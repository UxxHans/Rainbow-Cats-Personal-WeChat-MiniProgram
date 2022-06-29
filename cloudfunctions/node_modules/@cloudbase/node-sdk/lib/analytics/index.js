"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const httpRequest_1 = __importDefault(require("../utils/httpRequest"));
const utils_1 = require("../utils/utils");
const code_1 = require("../const/code");
const cloudbase_1 = require("../cloudbase");
const reportTypes = ['mall'];
function validateAnalyticsData(data) {
    if (Object.prototype.toString.call(data).slice(8, -1) !== 'Object') {
        return false;
    }
    const { report_data, report_type } = data;
    if (reportTypes.includes(report_type) === false) {
        return false;
    }
    if (Object.prototype.toString.call(report_data).slice(8, -1) !== 'Object') {
        return false;
    }
    if (report_data.action_time !== undefined && !Number.isInteger(report_data.action_time)) {
        return false;
    }
    if (typeof report_data.action_type !== 'string') {
        return false;
    }
    return true;
}
async function analytics(cloudbase, requestData) {
    // 获取openid, wxappid
    const { WX_OPENID, WX_APPID, } = cloudbase_1.CloudBase.getCloudbaseContext();
    if (!validateAnalyticsData(requestData)) {
        throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_PARAM, { message: '当前的上报数据结构不符合规范' }));
    }
    const action_time = requestData.report_data.action_time === undefined ? Math.floor(Date.now() / 1000) : requestData.report_data.action_time;
    const transformRequestData = {
        analytics_scene: requestData.report_type,
        analytics_data: Object.assign({ openid: WX_OPENID, wechat_mini_program_appid: WX_APPID }, requestData.report_data, { action_time })
    };
    const params = {
        action: 'analytics.report',
        requestData: transformRequestData
    };
    return httpRequest_1.default({
        config: cloudbase.config,
        params,
        method: 'post',
        headers: {
            'content-type': 'application/json'
        }
    });
}
exports.analytics = analytics;
