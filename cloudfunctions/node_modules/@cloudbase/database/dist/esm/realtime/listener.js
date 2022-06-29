export class RealtimeListener {
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
