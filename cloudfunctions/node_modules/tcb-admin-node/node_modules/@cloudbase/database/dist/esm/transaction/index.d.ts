import { Db } from '../index';
import { CollectionReference } from './collection';
interface TransactionAPI {
    send(interfaceName: string, param?: any): any;
}
export declare class Transaction {
    private _id;
    private _db;
    private _request;
    aborted: boolean;
    abortReason: any;
    commited: boolean;
    inited: boolean;
    constructor(db: Db);
    init(): Promise<void>;
    collection(collName: string): CollectionReference;
    getTransactionId(): string;
    getRequestMethod(): TransactionAPI;
    commit(): Promise<CommitResult>;
    rollback(customRollbackRes: any): Promise<RollbackResult>;
}
export declare function startTransaction(): Promise<Transaction>;
export declare function runTransaction(callback: (transaction: Transaction) => void | Promise<any>, times?: number): Promise<any>;
interface CommitResult {
    requestId: string;
}
interface RollbackResult {
    requestId: string;
}
export {};
