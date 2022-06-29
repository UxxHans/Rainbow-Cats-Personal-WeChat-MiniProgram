interface GetResult {
    requestId: string;
    data: any;
}
interface UpdateResult {
    requestId: string;
    updated: number;
}
declare type JsonString = string;
interface SetResult extends UpdateResult {
    upserted: JsonString;
}
interface DeleteResult {
    requestId: string;
    deleted: number | string;
}
export declare class DocumentReference {
    readonly id: string | number;
    private _transaction;
    private _transactionId;
    create(data: any): Promise<any>;
    get(): Promise<GetResult>;
    set(data: Object): Promise<SetResult>;
    update(data: Object): Promise<UpdateResult>;
    delete(): Promise<DeleteResult>;
}
export {};
