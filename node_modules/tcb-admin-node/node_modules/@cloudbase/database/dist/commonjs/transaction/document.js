"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bson_1 = require("bson");
const code_1 = require("../const/code");
const update_1 = require("../serializer/update");
const datatype_1 = require("../serializer/datatype");
const util_1 = require("../util");
const GET_DOC = 'database.getInTransaction';
const UPDATE_DOC = 'database.updateDocInTransaction';
const DELETE_DOC = 'database.deleteDocInTransaction';
const INSERT_DOC = 'database.insertDocInTransaction';
class DocumentReference {
    constructor(transaction, coll, docID) {
        this._coll = coll;
        this.id = docID;
        this._transaction = transaction;
        this._request = this._transaction.getRequestMethod();
        this._transactionId = this._transaction.getTransactionId();
    }
    async create(data) {
        let params = {
            collectionName: this._coll,
            transactionId: this._transactionId,
            data: bson_1.EJSON.stringify(datatype_1.serialize(data), { relaxed: false })
        };
        if (this.id) {
            params['_id'] = this.id;
        }
        const res = await this._request.send(INSERT_DOC, params);
        if (res.code) {
            throw res;
        }
        const inserted = bson_1.EJSON.parse(res.inserted);
        const ok = bson_1.EJSON.parse(res.ok);
        if (ok == 1 && inserted == 1) {
            return Object.assign(Object.assign({}, res), { ok,
                inserted });
        }
        else {
            throw new Error(code_1.ERRORS.INSERT_DOC_FAIL.message);
        }
    }
    async get() {
        const param = {
            collectionName: this._coll,
            transactionId: this._transactionId,
            query: {
                _id: { $eq: this.id }
            }
        };
        const res = await this._request.send(GET_DOC, param);
        if (res.code)
            throw res;
        return {
            data: res.data !== 'null' ? util_1.Util.formatField(bson_1.EJSON.parse(res.data)) : bson_1.EJSON.parse(res.data),
            requestId: res.requestId
        };
    }
    async set(data) {
        const param = {
            collectionName: this._coll,
            transactionId: this._transactionId,
            query: {
                _id: { $eq: this.id }
            },
            data: bson_1.EJSON.stringify(datatype_1.serialize(data), { relaxed: false }),
            upsert: true
        };
        const res = await this._request.send(UPDATE_DOC, param);
        if (res.code)
            throw res;
        return Object.assign(Object.assign({}, res), { updated: bson_1.EJSON.parse(res.updated), upserted: res.upserted
                ? JSON.parse(res.upserted)
                : null });
    }
    async update(data) {
        const param = {
            collectionName: this._coll,
            transactionId: this._transactionId,
            query: {
                _id: { $eq: this.id }
            },
            data: bson_1.EJSON.stringify(update_1.UpdateSerializer.encode(data), {
                relaxed: false
            })
        };
        const res = await this._request.send(UPDATE_DOC, param);
        if (res.code)
            throw res;
        return Object.assign(Object.assign({}, res), { updated: bson_1.EJSON.parse(res.updated) });
    }
    async delete() {
        const param = {
            collectionName: this._coll,
            transactionId: this._transactionId,
            query: {
                _id: { $eq: this.id }
            }
        };
        const res = await this._request.send(DELETE_DOC, param);
        if (res.code)
            throw res;
        return Object.assign(Object.assign({}, res), { deleted: bson_1.EJSON.parse(res.deleted) });
    }
}
exports.DocumentReference = DocumentReference;
