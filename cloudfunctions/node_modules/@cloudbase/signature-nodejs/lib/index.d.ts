export * from './keyvalue';
export * from './signer';
export * from './utils.http';
export * from './utils.lang';
export * from './utils';
interface IKV {
    [key: string]: any;
}
export declare function sign(options: {
    secretId: string;
    secretKey: string;
    method: string;
    url: string;
    headers: IKV;
    params: IKV;
    timestamp: number;
    withSignedParams?: boolean;
}): {
    authorization: string;
    timestamp: number;
    multipart: any;
};
