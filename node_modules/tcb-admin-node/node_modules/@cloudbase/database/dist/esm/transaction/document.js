import { EJSON } from 'bson';
import { ERRORS } from '../const/code';
import { UpdateSerializer } from '../serializer/update';
import { serialize } from '../serializer/datatype';
import { Util } from '../util';
const GET_DOC = 'database.getInTransaction';
const UPDATE_DOC = 'database.updateDocInTransaction';
const DELETE_DOC = 'database.deleteDocInTransaction';
const INSERT_DOC = 'database.insertDocInTransaction';
export class DocumentReference {
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
            data: EJSON.stringify(serialize(data), { relaxed: false })
        };
        if (this.id) {
            params['_id'] = this.id;
        }
        const res = await this._request.send(INSERT_DOC, params);
        if (res.code) {
            throw res;
        }
        const inserted = EJSON.parse(res.inserted);
        const ok = EJSON.parse(res.ok);
        if (ok == 1 && inserted == 1) {
            return Object.assign(Object.assign({}, res), { ok,
                inserted });
        }
        else {
            throw new Error(ERRORS.INSERT_DOC_FAIL.message);
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
            data: res.data !== 'null' ? Util.formatField(EJSON.parse(res.data)) : EJSON.parse(res.data),
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
            data: EJSON.stringify(serialize(data), { relaxed: false }),
            upsert: true
        };
        const res = await this._request.send(UPDATE_DOC, param);
        if (res.code)
            throw res;
        return Object.assign(Object.assign({}, res), { updated: EJSON.parse(res.updated), upserted: res.upserted
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
            data: EJSON.stringify(UpdateSerializer.encode(data), {
                relaxed: false
            })
        };
        const res = await this._request.send(UPDATE_DOC, param);
        if (res.code)
            throw res;
        return Object.assign(Object.assign({}, res), { updated: EJSON.parse(res.updated) });
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
        return Object.assign(Object.assign({}, res), { deleted: EJSON.parse(res.deleted) });
    }
}
