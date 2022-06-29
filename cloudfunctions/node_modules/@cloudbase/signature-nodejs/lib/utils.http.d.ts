/**
 * 是否能够使用 FormData 发送数据
 * @param {any} data - 待发送的数据
 */
export declare function canUseFormdata(data: any): boolean;
/**
 * 是否一定要通过 FormData 发送数据
 * 如果有 Buffer 和 Stream 必须用 multipart/form-data，如果同时还含有
 * @param {any} data - 待发送的数据
 */
export declare function mustUseFormdata(data: any): boolean;
