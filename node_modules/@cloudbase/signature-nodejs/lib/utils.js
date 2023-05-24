"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
function formateDate(timestamp) {
    return new Date(timestamp * 1000).toISOString().split('T')[0];
}
exports.formateDate = formateDate;
function second() {
    // istanbul ignore next
    return Math.floor(new Date().getTime() / 1000);
}
exports.second = second;
function stringify(v) {
    return typeof v !== 'string' ? JSON.stringify(v) : v;
}
exports.stringify = stringify;
function sha256hash(string, encoding = 'hex') {
    return crypto
        .createHash('sha256')
        .update(string)
        .digest(encoding);
}
exports.sha256hash = sha256hash;
function sha256hmac(string, secret = '', encoding) {
    return crypto
        .createHmac('sha256', secret)
        .update(string)
        .digest(encoding);
}
exports.sha256hmac = sha256hmac;
function isNodeEnv() {
    return process && process.release && process.release.name === 'node';
}
exports.isNodeEnv = isNodeEnv;
