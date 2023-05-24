"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const utils_lang_1 = require("./utils.lang");
const isStream = require('is-stream');
/**
 * 是否能够使用 FormData 发送数据
 * @param {any} data - 待发送的数据
 */
function canUseFormdata(data) {
    let enable = true;
    for (const key in data) {
        const value = data[key];
        if (!isStream(value) && (utils_1.isNodeEnv() && !Buffer.isBuffer(value)) && !utils_lang_1.isString(value) && !utils_lang_1.isNumber(value)) {
            enable = false;
            break;
        }
    }
    return enable;
}
exports.canUseFormdata = canUseFormdata;
/**
 * 是否一定要通过 FormData 发送数据
 * 如果有 Buffer 和 Stream 必须用 multipart/form-data，如果同时还含有
 * @param {any} data - 待发送的数据
 */
function mustUseFormdata(data) {
    let must = false;
    for (const key in data) {
        const value = data[key];
        if ((utils_1.isNodeEnv() && Buffer.isBuffer(value)) || isStream(value)) {
            must = true;
            break;
        }
    }
    return must;
}
exports.mustUseFormdata = mustUseFormdata;
