"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isNumber(v) {
    return v === +v;
}
exports.isNumber = isNumber;
function isString(v) {
    return typeof v === 'string';
}
exports.isString = isString;
function isObject(v) {
    return v != null && typeof v === 'object' && Array.isArray(v) === false;
}
exports.isObject = isObject;
function isPlainObject(v) {
    return isObject(v) && [null, Object.prototype].includes(Object.getPrototypeOf(v));
}
exports.isPlainObject = isPlainObject;
