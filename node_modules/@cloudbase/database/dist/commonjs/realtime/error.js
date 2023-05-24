"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RealtimeErrorMessageError extends Error {
    constructor(serverErrorMsg) {
        super(`Watch Error ${JSON.stringify(serverErrorMsg.msgData)} (requestid: ${serverErrorMsg.requestId})`);
        this.isRealtimeErrorMessageError = true;
        this.payload = serverErrorMsg;
    }
}
exports.RealtimeErrorMessageError = RealtimeErrorMessageError;
exports.isRealtimeErrorMessageError = (e) => e && e.isRealtimeErrorMessageError;
