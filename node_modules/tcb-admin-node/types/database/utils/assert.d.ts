import { CloudSDKError } from './error';
interface AssertionResult {
    passed: boolean;
    reason: string;
}
export declare function validType<T>(input: any, ref: T, name?: string): AssertionResult;
export declare function assertType<T>(param: T, ref: any, name?: string, ErrorClass?: typeof CloudSDKError): void;
export declare function assertRequiredParam(param: any, name: string, funcName: string, ErrorClass?: typeof CloudSDKError): void;
export interface IAssertStringLengthOptions {
    name: string;
    input: string;
    max: number;
    maxWording?: string;
    ErrorClass?: typeof CloudSDKError;
}
export declare function assertStringLength({ name, input, max, maxWording, ErrorClass, }: IAssertStringLengthOptions): void;
export interface IAssertObjectNotEmptyOptions {
    target: object;
    name: string;
    ErrorClass?: typeof CloudSDKError;
}
export declare function assertObjectNotEmpty({ target, name, ErrorClass, }: IAssertObjectNotEmptyOptions): void;
export {};
