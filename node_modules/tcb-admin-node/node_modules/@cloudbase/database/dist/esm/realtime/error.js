export class RealtimeErrorMessageError extends Error {
    constructor(serverErrorMsg) {
        super(`Watch Error ${JSON.stringify(serverErrorMsg.msgData)} (requestid: ${serverErrorMsg.requestId})`);
        this.isRealtimeErrorMessageError = true;
        this.payload = serverErrorMsg;
    }
}
export const isRealtimeErrorMessageError = (e) => e && e.isRealtimeErrorMessageError;
