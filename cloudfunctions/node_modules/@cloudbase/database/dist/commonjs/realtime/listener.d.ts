import { VirtualWebSocketClient } from './virtual-websocket-client';
import { IRealtimeListenerConstructorOptions, DBRealtimeListener } from '../typings/index';
interface IRealtimeListenerOptions extends IRealtimeListenerConstructorOptions {
    close: () => void;
    debug?: boolean;
    virtualClient?: VirtualWebSocketClient;
}
export declare class RealtimeListener implements DBRealtimeListener {
    close: () => void;
    onChange: (res: any) => void;
    onError: (error: any) => void;
    constructor(options: IRealtimeListenerOptions);
}
export {};
