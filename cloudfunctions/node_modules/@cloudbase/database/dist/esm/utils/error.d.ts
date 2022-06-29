export interface ICloudSDKError extends Error {
    errCode: number;
    errMsg: string;
}
export declare class CloudSDKError extends Error {
    errCode: string;
    errMsg: string;
    requestID?: string;
    constructor(options: IErrorConstructorOptions);
    message: string;
}
interface IErrorConstructorOptions {
    errCode?: string;
    errMsg: string;
}
export declare function isSDKError(error: any): error is CloudSDKError;
export interface IGenericError<T extends string, P = any> extends Error {
    type: T;
    payload: P;
    generic: boolean;
}
export declare const isGenericError: <T extends string, P>(e: any) => e is IGenericError<T, P>;
export declare class TimeoutError extends Error implements IGenericError<'timeout', null> {
    type: "timeout";
    payload: any;
    generic: boolean;
    constructor(message: string);
}
export declare const isTimeoutError: (e: any) => e is TimeoutError;
export declare class CancelledError extends Error implements IGenericError<'cancelled', null> {
    type: "cancelled";
    payload: any;
    generic: boolean;
    constructor(message: string);
}
export declare const isCancelledError: (e: any) => e is CancelledError;
export {};
