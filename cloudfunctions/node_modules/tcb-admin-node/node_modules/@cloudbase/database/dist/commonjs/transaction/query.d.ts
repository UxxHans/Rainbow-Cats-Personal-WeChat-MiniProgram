import { Transaction } from './index';
export declare class Query {
    protected _transaction: Transaction;
    constructor(transaction: Transaction, coll: string);
}
