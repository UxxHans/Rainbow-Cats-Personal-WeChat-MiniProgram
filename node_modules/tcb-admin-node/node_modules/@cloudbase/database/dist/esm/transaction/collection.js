import { DocumentReference } from './document';
import { Query } from './query';
export class CollectionReference extends Query {
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
        return new DocumentReference(this._transaction, this._coll, docID);
    }
    add(data) {
        let docID;
        if (data._id !== undefined) {
            docID = data._id;
        }
        let docRef = new DocumentReference(this._transaction, this._coll, docID);
        return docRef.create(data);
    }
}
