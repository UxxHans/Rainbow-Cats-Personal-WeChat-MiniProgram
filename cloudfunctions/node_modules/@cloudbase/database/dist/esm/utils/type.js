import { InternalSymbol } from './symbol';
export const getType = (x) => Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
export const isObject = (x) => getType(x) === 'object';
export const isString = (x) => getType(x) === 'string';
export const isNumber = (x) => getType(x) === 'number';
export const isPromise = (x) => getType(x) === 'promise';
export const isFunction = (x) => typeof x === 'function';
export const isArray = (x) => Array.isArray(x);
export const isDate = (x) => getType(x) === 'date';
export const isRegExp = (x) => getType(x) === 'regexp';
export const isInternalObject = (x) => x && (x._internalType instanceof InternalSymbol);
export const isPlainObject = (obj) => {
    if (typeof obj !== 'object' || obj === null)
        return false;
    let proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(obj) === proto;
};
