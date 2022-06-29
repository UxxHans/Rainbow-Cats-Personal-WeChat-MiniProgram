import { Db } from '../index';
import { CollectionReference } from './collection';
const START = 'database.startTransaction';
const COMMIT = 'database.commitTransaction';
const ABORT = 'database.abortTransaction';
export class Transaction {
    constructor(db) {
        this._db = db;
        this._request = new Db.reqClass(this._db.config);
    }
    async init() {
        const res = await this._request.send(START);
        if (res.code) {
            throw res;
        }
        this._id = res.transactionId;
    }
    collection(collName) {
        if (!collName) {
            throw new Error('Collection name is required');
        }
        return new CollectionReference(this, collName);
    }
    getTransactionId() {
        return this._id;
    }
    getRequestMethod() {
        return this._request;
    }
    async commit() {
        const param = {
            transactionId: this._id
        };
        const res = await this._request.send(COMMIT, param);
        if (res.code)
            throw res;
        return res;
    }
    async rollback() {
        const param = {
            transactionId: this._id
        };
        const res = await this._request.send(ABORT, param);
        if (res.code)
            throw res;
        return res;
    }
}
export async function startTransaction() {
    const transaction = new Transaction(this);
    await transaction.init();
    return transaction;
}
export async function runTransaction(callback, times = 3) {
    if (times <= 0) {
        throw new Error('Transaction failed');
    }
    try {
        const transaction = new Transaction(this);
        await transaction.init();
        await callback(transaction);
        await transaction.commit();
    }
    catch (error) {
        console.log(error);
        return runTransaction.bind(this)(callback, --times);
    }
}
