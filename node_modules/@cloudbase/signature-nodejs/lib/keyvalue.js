"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_lang_1 = require("./utils.lang");
class SortedKeyValue {
    constructor(obj, selectkeys) {
        this._keys = [];
        this._values = [];
        this._pairs = [];
        this._obj = {};
        if (!utils_lang_1.isObject(obj)) {
            return this;
        }
        // https://stackoverflow.com/questions/5525795/does-javascript-guarantee-object-property-order
        // https://www.stefanjudis.com/today-i-learned/property-order-is-predictable-in-javascript-objects-since-es2015/
        Object.keys(obj || {}).sort((l, r) => {
            return l.toString().localeCompare(r);
        }).forEach(key => {
            if (!selectkeys || selectkeys.includes(key)) {
                this._keys.push(key);
                this._values.push(obj[key]);
                this._pairs.push([key, obj[key]]);
                this._obj[key.toLowerCase()] = obj[key];
            }
        });
    }
    static kv(obj, selectkeys) {
        return new SortedKeyValue(obj, selectkeys);
    }
    get(key) {
        return this._obj[key];
    }
    keys() {
        return this._keys;
    }
    values() {
        return this._values;
    }
    pairs() {
        return this._pairs;
    }
    toString(kvSeparator = '=', joinSeparator = '&') {
        return this._pairs.map((pair) => pair.join(kvSeparator)).join(joinSeparator);
    }
}
exports.SortedKeyValue = SortedKeyValue;
