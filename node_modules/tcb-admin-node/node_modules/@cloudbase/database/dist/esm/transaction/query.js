export class Query {
    constructor(transaction, coll) {
        this._coll = coll;
        this._transaction = transaction;
    }
}
