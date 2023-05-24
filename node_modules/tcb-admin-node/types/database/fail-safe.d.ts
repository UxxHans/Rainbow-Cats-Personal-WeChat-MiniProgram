import { CloudSDKError } from './error';
declare type AnyFn<T = any> = (...args: any[]) => T;
export declare function tryCatch<T>(fn: AnyFn<T>, customErrorStack?: string): T | CloudSDKError;
export declare function wrapWithTryCatch<T>(fn: AnyFn<T>, customErrorStack?: string): AnyFn<T | CloudSDKError>;
interface IWrapParamCallbacksWithTryCatchOptions {
    apiName: string;
    param: {
        success?: AnyFn;
        fail?: AnyFn;
        complete?: AnyFn;
    };
}
export declare function wrapParamCallbacksWithTryCatch<T>(options: IWrapParamCallbacksWithTryCatchOptions): void;
export {};
