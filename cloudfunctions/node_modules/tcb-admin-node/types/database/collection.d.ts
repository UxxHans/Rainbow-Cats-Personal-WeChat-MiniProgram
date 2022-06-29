import { DocumentReference } from "./document";
import { Query } from "./query";
export declare class CollectionReference extends Query {
    readonly name: string;
    doc(docID?: string): DocumentReference;
    add(data: Object): Promise<any>;
}
