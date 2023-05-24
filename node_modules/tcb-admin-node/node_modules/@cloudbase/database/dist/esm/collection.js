import { DocumentReference } from './document';
import { Query } from './query';
import Aggregation from './aggregate';
export class CollectionReference extends Query {
    constructor(db, coll) {
        super(db, coll);
    }
    get name() {
        return this._coll;
    }
    doc(docID) {
        if (typeof docID !== 'string' && typeof docID !== 'number') {
            throw new Error('docId必须为字符串或数字');
        }
        return new DocumentReference(this._db, this._coll, docID);
    }
    add(data, callback) {
        let docRef = new DocumentReference(this._db, this._coll, undefined);
        return docRef.create(data, callback);
    }
    aggregate() {
        return new Aggregation(this._db, this._coll);
    }
}
