import { DataType, QueueType } from './index';
export declare type IRequestMsgType = 'LOGIN' | 'INIT_WATCH' | 'REBUILD_WATCH' | 'CHECK_LAST' | 'CLOSE_WATCH' | 'PING';
export declare type IResponseMsgType = 'LOGIN_RES' | 'INIT_EVENT' | 'NEXT_EVENT' | 'CHECK_EVENT' | 'PONG' | 'ERROR';
export interface IRequestMessageBase<W extends boolean = true> {
    watchId: W extends true ? string : undefined;
    requestId: string;
    msgType: IRequestMsgType;
    msgData: IRequestMessageMsgData;
}
export declare type IRequestMessageMsgData = IRequestMessageInitWatchData | IRequestMessageLoginData | IRequestMessageRebuildWatchData | IRequestMessageCheckLastData | IRequestMessageCloseWatchData | IRequestMessagePingData;
export declare type IRequestMessage = IRequestMessageInitWatchMsg | IRequestMessageLoginMsg | IRequestMessageRebuildWatchMsg | IRequestMessageCheckLastMsg | IRequestMessageCloseWatchMsg | IRequestMessagePingMsg;
export interface IRequestMessageLoginData {
    envId: string;
    accessToken: string;
    referrer: 'web';
    sdkVersion: string;
    dataVersion: string;
}
export interface IRequestExtraMessageLoginData {
    runtime: string;
    signStr: string;
    secretVersion: string;
}
export interface IRequestMessageLoginMsg extends IRequestMessageBase<false> {
    msgType: 'LOGIN';
    msgData: IRequestMessageLoginData;
    exMsgData?: IRequestExtraMessageLoginData;
}
export interface IRequestMessageInitWatchData {
    envId: string;
    collName: string;
    query: string;
    limit?: number;
    orderBy?: Record<string, string>;
}
export interface IRequestMessageInitWatchMsg extends IRequestMessageBase {
    msgType: 'INIT_WATCH';
    msgData: IRequestMessageInitWatchData;
}
export interface IRequestMessageRebuildWatchData {
    envId: string;
    collName: string;
    queryID: string;
    eventID: number;
}
export interface IRequestMessageRebuildWatchMsg extends IRequestMessageBase {
    msgType: 'REBUILD_WATCH';
    msgData: IRequestMessageRebuildWatchData;
}
export interface IRequestMessageCheckLastData {
    queryID: string;
    eventID: number;
}
export interface IRequestMessageCheckLastMsg extends IRequestMessageBase {
    msgType: 'CHECK_LAST';
    msgData: IRequestMessageCheckLastData;
}
export declare type IRequestMessageCloseWatchData = null;
export interface IRequestMessageCloseWatchMsg extends IRequestMessageBase {
    msgType: 'CLOSE_WATCH';
    msgData: IRequestMessageCloseWatchData;
}
export declare type IRequestMessagePingData = null;
export interface IRequestMessagePingMsg extends IRequestMessageBase<false> {
    msgType: 'PING';
    msgData: IRequestMessagePingData;
}
export interface IResponseMessageBase<W extends boolean = true> {
    watchId: W extends true ? string : undefined;
    requestId: string;
    msgType: IResponseMsgType;
    msgData: IResponseMessageMsgData;
}
export declare type IResponseMessageMsgData = IResponseMessageLoginResData | IResponseMessageInitEventData | IResponseMessageNextEventData | IResponseMessageCheckEventData | IResponseMessagePongData | IResponseMessageErrorData;
export declare type IResponseMessage = IResponseMessageLoginResMsg | IResponseMessageInitEventMsg | IResponseMessageNextEventMsg | IResponseMessageCheckEventMsg | IResponseMessagePongMsg | IResponseMessageErrorMsg;
export declare type IResponseMessageLoginResData = {
    envId: string;
} & Partial<IResponseMessageErrorData>;
export interface IResponseMessageLoginResMsg extends IResponseMessageBase<false> {
    msgType: 'LOGIN_RES';
    msgData: IResponseMessageLoginResData;
}
export interface IResponseMessageInitEventData {
    queryID: string;
    currEvent: number;
    events: IDBEvent[];
}
export interface IResponseMessageInitEventMsg extends IResponseMessageBase {
    msgType: 'INIT_EVENT';
    msgData: IResponseMessageInitEventData;
}
export interface IResponseMessageNextEventData {
    queryID: string;
    currEvent: number;
    events: IDBEvent[];
}
export interface IResponseMessageNextEventMsg extends IResponseMessageBase {
    msgType: 'NEXT_EVENT';
    msgData: IResponseMessageNextEventData;
}
export interface IResponseMessageCheckEventData {
    queryID: string;
    currEvent: number;
}
export interface IResponseMessageCheckEventMsg extends IResponseMessageBase {
    msgType: 'CHECK_EVENT';
    msgData: IResponseMessageCheckEventData;
}
export declare type IResponseMessagePongData = null;
export interface IResponseMessagePongMsg extends IResponseMessageBase {
    msgType: 'PONG';
    msgData: IResponseMessagePongData;
}
export declare type IResponseMessageErrorData = {
    message: string;
} & ({
    code: 'SYS_ERR';
} | {
    code: 'CHECK_LOGIN_FAILED';
} | {
    code: 'SIGN_INVALID_ERROR';
} | {
    code: 'SIGN_EXPIRED_ERROR';
} | {
    code: 'INVALIID_ENV';
} | {
    code: 'SIGN_PARAM_INVALID';
} | {
    code: 'COLLECTION_PERMISSION_DENIED';
} | {
    code: 'QUERYID_INVALID_ERROR';
});
export interface IResponseMessageErrorMsg extends IResponseMessageBase {
    msgType: 'ERROR';
    msgData: IResponseMessageErrorData;
}
export declare type IDBEvent = IDBInitEvent | IDBNextEvent;
export interface IDBEventBase {
    ID: number;
    DataType: DataType;
    QueueType: QueueType;
    DocID: string;
    Doc: string;
}
export interface IDBInitEvent extends IDBEventBase {
    DataType: 'init';
    QueueType: 'init';
    UpdatedFields?: any;
    removedFields?: any;
}
export declare type IDBNextEvent = IDBNextEventDataUpdate | IDBNextEventDataReplace | IDBNextEventDataAdd | IDBNextEventDataRemove | IDBNextEventDataLimit;
export declare type IDBNextEventDataUpdate = IDBNextEventDataUpdateQueueUpdate | IDBNextEventDataUpdateQueueEnqueue | IDBNextEventDataUpdateQueueDequeue;
export declare type IDBNextEventDataReplace = IDBNextEventDataReplaceQueueUpdate | IDBNextEventDataReplaceQueueEnqueue | IDBNextEventDataReplaceQueueDequeue;
export declare type IDBNextEventDataLimit = IDBNextEventDataLimitQueueEnqueue | IDBNextEventDataLimitQueueDequeue;
export interface IDBNextEventDataUpdateQueueUpdate extends IDBEventBase {
    DataType: 'update';
    QueueType: 'update';
    Doc: '';
    UpdatedFields: string;
    RemovedFields: string;
}
export interface IDBNextEventDataUpdateQueueEnqueue extends IDBEventBase {
    DataType: 'update';
    QueueType: 'enqueue';
    Doc: string;
    UpdatedFields: string;
    RemovedFields: string;
}
export interface IDBNextEventDataUpdateQueueDequeue extends IDBEventBase {
    DataType: 'update';
    QueueType: 'dequeue';
    Doc: '';
    UpdatedFields: string;
    RemovedFields: string;
}
export interface IDBNextEventDataReplaceQueueUpdate extends IDBEventBase {
    DataType: 'replace';
    QueueType: 'update';
    Doc: string;
    UpdatedFields: '';
    RemovedFields: '';
}
export interface IDBNextEventDataReplaceQueueEnqueue extends IDBEventBase {
    DataType: 'replace';
    QueueType: 'enqueue';
    Doc: string;
    UpdatedFields: '';
    RemovedFields: '';
}
export interface IDBNextEventDataReplaceQueueDequeue extends IDBEventBase {
    DataType: 'replace';
    QueueType: 'dequeue';
    Doc: string;
    UpdatedFields: '';
    RemovedFields: '';
}
export interface IDBNextEventDataAdd extends IDBEventBase {
    DataType: 'add';
    QueueType: 'enqueue';
}
export interface IDBNextEventDataRemove extends IDBEventBase {
    DataType: 'remove';
    QueueType: 'dequeue';
    Doc: '';
}
export interface IDBNextEventDataLimitQueueEnqueue extends IDBEventBase {
    DataType: 'limit';
    QueueType: 'enqueue';
    Doc: string;
    UpdatedFields: '';
    RemovedFields: '';
}
export interface IDBNextEventDataLimitQueueDequeue extends IDBEventBase {
    DataType: 'limit';
    QueueType: 'dequeue';
    Doc: '';
    UpdatedFields: '';
    RemovedFields: '';
}
