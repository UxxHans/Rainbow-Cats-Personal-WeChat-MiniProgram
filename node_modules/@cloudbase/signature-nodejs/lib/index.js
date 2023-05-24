"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./keyvalue"));
__export(require("./signer"));
__export(require("./utils.http"));
__export(require("./utils.lang"));
__export(require("./utils"));
const signer_1 = require("./signer");
const utils_1 = require("./utils");
const clone = require('clone');
function sign(options) {
    const { secretId, secretKey, method, url } = options;
    const signer = new signer_1.Signer({ secretId, secretKey }, 'tcb');
    const headers = clone(options.headers || {});
    const params = clone(options.params || {});
    const timestamp = options.timestamp || utils_1.second() - 1;
    const signatureInfo = signer.tc3sign(method, url, headers, params, timestamp, {
        withSignedParams: options.withSignedParams
    });
    return {
        authorization: signatureInfo.authorization,
        timestamp: signatureInfo.timestamp,
        multipart: signatureInfo.multipart
    };
}
exports.sign = sign;
