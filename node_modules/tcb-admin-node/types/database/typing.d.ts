export interface IAPIError {
    errMsg: string;
}
export interface IAPIParam<T = any> {
    config?: ICloudConfig;
    success?: (res: T) => void;
    fail?: (err: IAPIError) => void;
    complete?: (val: T | IAPIError) => void;
}
export interface IAPISuccessParam {
    errMsg: string;
}
export declare type IAPICompleteParam = IAPISuccessParam | IAPIError;
export declare type IAPIFunction<T, P extends IAPIParam<T>> = (param: P) => Promise<T> | any;
export interface IInitCloudConfig {
    env?: string | {
        database?: string;
        functions?: string;
        storage?: string;
    };
    traceUser?: boolean;
}
export interface ICloudConfig {
    env?: string;
    traceUser?: boolean;
}
export interface IICloudAPI {
    init: (config?: IInitCloudConfig) => void;
    [api: string]: AnyFunction | IAPIFunction<any, any>;
}
export interface ICloudService {
    name: string;
    getAPIs: () => {
        [name: string]: IAPIFunction<any, any>;
    };
}
export interface ICloudServices {
    [serviceName: string]: ICloudService;
}
export interface ICloudMetaData {
    session_id: string;
}
declare class InternalSymbol {
}
export declare type AnyObject = {
    [x: string]: any;
};
export declare type AnyArray = any[];
export declare type AnyFunction = (...args: any[]) => any;
export declare class Database {
    readonly config: ICloudConfig;
    readonly command: DatabaseCommand;
    readonly Geo: Geo;
    readonly serverDate: () => ServerDate;
    private constructor();
    collection(collectionName: string): CollectionReference;
}
export declare class CollectionReference extends Query {
    readonly collectionName: string;
    readonly database: Database;
    private constructor();
    doc(docId: string | number): DocumentReference;
    add(options: IAddDocumentOptions): Promise<IAddResult> | void;
}
export declare class DocumentReference {
    private constructor();
    field(object: object): this;
    get(options?: IGetDocumentOptions): Promise<IQuerySingleResult> | void;
    set(options?: ISetSingleDocumentOptions): Promise<ISetResult> | void;
    update(options?: IUpdateSingleDocumentOptions): Promise<IUpdateResult> | void;
    remove(options?: IRemoveSingleDocumentOptions): Promise<IRemoveResult> | void;
}
export declare class Query {
    where(condition: IQueryCondition): Query;
    orderBy(fieldPath: string, order: string): Query;
    limit(max: number): Query;
    skip(offset: number): Query;
    field(object: object): Query;
    get(options?: IGetDocumentOptions): Promise<IQueryResult> | void;
    count(options?: ICountDocumentOptions): Promise<ICountResult> | void;
}
export interface DatabaseCommand {
    eq(val: any): DatabaseQueryCommand;
    neq(val: any): DatabaseQueryCommand;
    gt(val: any): DatabaseQueryCommand;
    gte(val: any): DatabaseQueryCommand;
    lt(val: any): DatabaseQueryCommand;
    lte(val: any): DatabaseQueryCommand;
    in(val: any[]): DatabaseQueryCommand;
    nin(val: any[]): DatabaseQueryCommand;
    and(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand;
    or(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand;
    set(val: any): DatabaseUpdateCommand;
    remove(): DatabaseUpdateCommand;
    inc(val: number): DatabaseUpdateCommand;
    mul(val: number): DatabaseUpdateCommand;
    push(...values: any[]): DatabaseUpdateCommand;
    pop(): DatabaseUpdateCommand;
    shift(): DatabaseUpdateCommand;
    unshift(...values: any[]): DatabaseUpdateCommand;
}
export declare enum LOGIC_COMMANDS_LITERAL {
    AND = "and",
    OR = "or",
    NOT = "not",
    NOR = "nor"
}
export declare class DatabaseLogicCommand {
    fieldName: string | InternalSymbol;
    operator: LOGIC_COMMANDS_LITERAL | string;
    operands: any[];
    _setFieldName(fieldName: string): DatabaseLogicCommand;
    and(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand;
    or(...expressions: (DatabaseLogicCommand | IQueryCondition)[]): DatabaseLogicCommand;
}
export declare enum QUERY_COMMANDS_LITERAL {
    EQ = "eq",
    NEQ = "neq",
    GT = "gt",
    GTE = "gte",
    LT = "lt",
    LTE = "lte",
    IN = "in",
    NIN = "nin"
}
export declare class DatabaseQueryCommand extends DatabaseLogicCommand {
    operator: QUERY_COMMANDS_LITERAL | string;
    _setFieldName(fieldName: string): DatabaseQueryCommand;
    eq(val: any): DatabaseLogicCommand;
    neq(val: any): DatabaseLogicCommand;
    gt(val: any): DatabaseLogicCommand;
    gte(val: any): DatabaseLogicCommand;
    lt(val: any): DatabaseLogicCommand;
    lte(val: any): DatabaseLogicCommand;
    in(val: any[]): DatabaseLogicCommand;
    nin(val: any[]): DatabaseLogicCommand;
}
export declare enum UPDATE_COMMANDS_LITERAL {
    SET = "set",
    REMOVE = "remove",
    INC = "inc",
    MUL = "mul",
    PUSH = "push",
    POP = "pop",
    SHIFT = "shift",
    UNSHIFT = "unshift"
}
export declare class DatabaseUpdateCommand {
    fieldName: string | InternalSymbol;
    operator: UPDATE_COMMANDS_LITERAL;
    operands: any[];
    constructor(operator: UPDATE_COMMANDS_LITERAL, operands: any[], fieldName?: string | InternalSymbol);
    _setFieldName(fieldName: string): DatabaseUpdateCommand;
}
export declare class Batch {
}
export declare class APIBaseContract<PROMISE_RETURN, CALLBACK_RETURN, PARAM extends IAPIParam, CONTEXT = any> {
    getContext(param: PARAM): CONTEXT;
    getCallbackReturn(param: PARAM, context: CONTEXT): CALLBACK_RETURN;
    getFinalParam<T extends PARAM>(param: PARAM, context: CONTEXT): T;
    run<T extends PARAM>(param: T): Promise<PROMISE_RETURN>;
}
export interface GeoPointConstructor {
    new (longitude: number, latitide: number): GeoPoint;
}
export interface Geo {
    Point: {
        new (longitude: number, latitide: number): GeoPoint;
        (longitude: number, latitide: number): GeoPoint;
    };
}
export declare abstract class GeoPoint {
    longitude: number;
    latitude: number;
    constructor(longitude: number, latitude: number);
    toJSON(): object;
    toString(): string;
}
export interface IServerDateOptions {
    offset: number;
}
export declare abstract class ServerDate {
    readonly options: IServerDateOptions;
    constructor(options?: IServerDateOptions);
}
export declare type DocumentId = string | number;
export interface IDocumentData {
    _id?: DocumentId;
    [key: string]: any;
}
export interface IDBAPIParam extends IAPIParam {
}
export interface IAddDocumentOptions extends IDBAPIParam {
    data: IDocumentData;
}
export interface IGetDocumentOptions extends IDBAPIParam {
}
export interface ICountDocumentOptions extends IDBAPIParam {
}
export interface IUpdateDocumentOptions extends IDBAPIParam {
    data: IUpdateCondition;
}
export interface IUpdateSingleDocumentOptions extends IDBAPIParam {
    data: IUpdateCondition;
}
export interface ISetDocumentOptions extends IDBAPIParam {
    data: IUpdateCondition;
}
export interface ISetSingleDocumentOptions extends IDBAPIParam {
    data: IUpdateCondition;
}
export interface IRemoveDocumentOptions extends IDBAPIParam {
    query: IQueryCondition;
}
export interface IRemoveSingleDocumentOptions extends IDBAPIParam {
}
export declare type IQueryCondition = Record<string, any> | DatabaseLogicCommand;
export interface ConditionRecord {
    [key: string]: IQueryCondition;
}
export declare type IStringQueryCondition = string;
export interface IQueryResult extends IAPISuccessParam {
    data: IDocumentData[];
}
export interface IQuerySingleResult extends IAPISuccessParam {
    data: IDocumentData;
}
export interface IUpdateCondition {
    [key: string]: any;
}
export declare type IStringUpdateCondition = string;
export interface ISetCondition {
}
export interface IAddResult extends IAPISuccessParam {
    _id: DocumentId;
}
export interface IUpdateResult extends IAPISuccessParam {
    stats: {
        updated: number;
    };
}
export interface ISetResult extends IAPISuccessParam {
    _id: DocumentId;
    stats: {
        updated: number;
        created: number;
    };
}
export interface IRemoveResult extends IAPISuccessParam {
    stats: {
        removed: number;
    };
}
export interface ICountResult extends IAPISuccessParam {
    total: number;
}
export {};
