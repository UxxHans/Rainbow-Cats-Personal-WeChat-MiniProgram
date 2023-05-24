import { IResponseMessage, IResponseMessageInitEventMsg } from '../typings/realtime';
export declare function genRequestId(prefix?: string): string;
export declare function isInitEventMessage(msg: IResponseMessage): msg is IResponseMessageInitEventMsg;
