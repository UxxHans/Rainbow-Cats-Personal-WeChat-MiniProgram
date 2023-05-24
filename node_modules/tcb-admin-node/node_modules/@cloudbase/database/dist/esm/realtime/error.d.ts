import { IResponseMessageErrorMsg } from '../typings/realtime';
export declare class RealtimeErrorMessageError extends Error {
    isRealtimeErrorMessageError: boolean;
    payload: IResponseMessageErrorMsg;
    constructor(serverErrorMsg: IResponseMessageErrorMsg);
}
export declare const isRealtimeErrorMessageError: (e: any) => e is RealtimeErrorMessageError;
