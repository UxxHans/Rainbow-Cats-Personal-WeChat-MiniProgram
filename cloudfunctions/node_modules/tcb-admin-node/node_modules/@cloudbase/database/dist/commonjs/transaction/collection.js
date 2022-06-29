"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("./document");
const query_1 = require("./query");
class CollectionReference extends query_1.Query {
    constructor(transaction, coll) {
        super(transaction, coll);
    }
    get name() {
        return this._coll;
    }
    doc(docID) {
        if (typeof docID !== 'string' && typeof docID !== 'number') {
            throw new Error('docId必须为字符串或数字');
        }
        return new document_1.DocumentReference(this._transaction, this._coll, docID);
    }
    add(data) {
        let docID;
        if (data._id !== undefined) {
            docID = data._id;
        }
        let docRef = new document_1.DocumentReference(this._transaction, this._coll, docID);
        return docRef.create(data);
    }
}
exports.CollectionReference = CollectionReference;
