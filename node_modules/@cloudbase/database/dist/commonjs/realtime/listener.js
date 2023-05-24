"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RealtimeListener {
    constructor(options) {
        this.close = options.close;
        this.onChange = options.onChange;
        this.onError = options.onError;
        if (options.debug) {
            Object.defineProperty(this, 'virtualClient', {
                get: () => {
                    return options.virtualClient;
                }
            });
        }
    }
}
exports.RealtimeListener = RealtimeListener;
