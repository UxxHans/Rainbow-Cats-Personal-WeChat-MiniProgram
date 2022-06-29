import { isString } from './type';
import { ERR_CODE } from '../config/error.config';
export class CloudSDKError extends Error {
    constructor(options) {
        super(options.errMsg);
        this.errCode = 'UNKNOWN_ERROR';
        Object.defineProperties(this, {
            message: {
                get() {
                    return (`errCode: ${this.errCode} ${ERR_CODE[this.errCode] ||
                        ''} | errMsg: ` + this.errMsg);
                },
                set(msg) {
                    this.errMsg = msg;
                }
            }
        });
        this.errCode = options.errCode || 'UNKNOWN_ERROR';
        this.errMsg = options.errMsg;
    }
    get message() {
        return `errCode: ${this.errCode} | errMsg: ` + this.errMsg;
    }
    set message(msg) {
        this.errMsg = msg;
    }
}
export function isSDKError(error) {
    return (error && error instanceof Error && isString(error.errMsg));
}
export const isGenericError = (e) => e.generic;
export class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.type = 'timeout';
        this.payload = null;
        this.generic = true;
    }
}
export const isTimeoutError = (e) => e.type === 'timeout';
export class CancelledError extends Error {
    constructor(message) {
        super(message);
        this.type = 'cancelled';
        this.payload = null;
        this.generic = true;
    }
}
export const isCancelledError = (e) => e.type === 'cancelled';
