"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Query {
    constructor(transaction, coll) {
        this._coll = coll;
        this._transaction = transaction;
    }
}
exports.Query = Query;
