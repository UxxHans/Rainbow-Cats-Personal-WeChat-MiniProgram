/// <reference types="node" />
export declare const signedParamsSeparator = ";";
interface IKV {
    [key: string]: any;
}
interface ICredential {
    secretId: string;
    secretKey: string;
}
interface ISignerOptions {
    allowSignBuffer?: boolean;
}
export declare class Signer {
    private credential;
    private service;
    private algorithm;
    private options;
    constructor(credential: ICredential, service: string, options?: ISignerOptions);
    static camSafeUrlEncode(str: any): string;
    /**
     * 将一个对象处理成 KeyValue 形式，嵌套的对象将会被处理成字符串，Key转换成小写字母
     * @param {Object}  obj - 待处理的对象
     * @param {Object}  options
     * @param {Boolean} options.enableBuffer
     */
    static formatKeyAndValue(obj: any, options?: {
        multipart?: boolean;
        enableValueToLowerCase?: boolean;
        selectedKeys?: string[];
        filter?: Function;
    }): any;
    static calcParamsHash(params: any, keys?: null | string[], options?: any): string;
    /**
     * 计算签名信息
     * @param {string} method       - Http Verb：GET/get POST/post 区分大小写
     * @param {string} url          - 地址：http://abc.org/api/v1?a=1&b=2
     * @param {Object} headers      - 需要签名的头部字段
     * @param {string} params       - 请求参数
     * @param {number} [timestamp]  - 签名时间戳
     * @param {object} [options]    - 可选参数
     */
    tc3sign(method: string, url: string, headers: IKV, params: IKV | string, timestamp: number, options?: {
        enableHostCheck?: boolean;
        enableContentTypeCheck?: boolean;
        withSignedParams?: boolean;
    }): {
        authorization: string;
        signedParams: string[];
        signedHeaders: string[];
        signature: string | Buffer;
        timestamp: number;
        multipart: any;
    };
}
export {};
