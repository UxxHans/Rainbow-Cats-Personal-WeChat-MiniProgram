export interface ICloudSDKError extends Error {
    errCode: number;
    errMsg: string;
}
export declare class CloudSDKError extends Error {
    errCode: number;
    errMsg: string;
    requestID?: string;
    constructor(options: IErrorConstructorOptions);
    message: string;
}
interface IErrorConstructorOptions {
    errCode?: number;
    errMsg: string;
}
export declare function isSDKError(error: any): error is CloudSDKError;
export declare function returnAsCloudSDKError(err: any, appendMsg?: string): CloudSDKError;
export declare function returnAsFinalCloudSDKError(err: any, apiName: string): CloudSDKError;
export {};
