interface IKV {
    [key: string]: any;
}
export declare class SortedKeyValue {
    private _keys;
    private _values;
    private _pairs;
    private _obj;
    static kv(obj: IKV, selectkeys?: string[]): SortedKeyValue;
    constructor(obj: IKV, selectkeys?: string[]);
    get(key: string): any;
    keys(): string[];
    values(): string[];
    pairs(): Array<[string, any]>;
    toString(kvSeparator?: string, joinSeparator?: string): string;
}
export {};
