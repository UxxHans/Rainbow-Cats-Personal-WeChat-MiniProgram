export declare class DocumentReference {
    readonly id: string;
    readonly projection: Object;
    set(data: Object): Promise<any>;
    update(data: Object): Promise<any>;
    remove(): Promise<any>;
    get(): Promise<any>;
    field(projection: Object): DocumentReference;
}
