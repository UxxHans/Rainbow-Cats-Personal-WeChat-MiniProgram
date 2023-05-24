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
export declare type AnyObject = {
    [x: string]: any;
};
export declare type AnyArray = any[];
export declare type AnyFunction = (...args: any[]) => any;
