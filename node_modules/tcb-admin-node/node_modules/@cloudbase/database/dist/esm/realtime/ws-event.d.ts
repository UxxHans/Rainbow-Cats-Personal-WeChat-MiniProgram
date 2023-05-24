import { CloudSDKError } from '../utils/error';
export declare const CLOSE_EVENT_CODE_INFO: {
    1000: {
        code: number;
        name: string;
        description: string;
    };
    1001: {
        code: number;
        name: string;
        description: string;
    };
    1002: {
        code: number;
        name: string;
        description: string;
    };
    1003: {
        code: number;
        name: string;
        description: string;
    };
    1005: {
        code: number;
        name: string;
        description: string;
    };
    1006: {
        code: number;
        name: string;
        description: string;
    };
    1007: {
        code: number;
        name: string;
        description: string;
    };
    1008: {
        code: number;
        name: string;
        description: string;
    };
    1009: {
        code: number;
        name: string;
        description: string;
    };
    1010: {
        code: number;
        name: string;
        description: string;
    };
    1011: {
        code: number;
        name: string;
        description: string;
    };
    1012: {
        code: number;
        name: string;
        description: string;
    };
    1013: {
        code: number;
        name: string;
        description: string;
    };
    1014: {
        code: number;
        name: string;
        description: string;
    };
    1015: {
        code: number;
        name: string;
        description: string;
    };
    3000: {
        code: number;
        name: string;
        description: string;
    };
    3001: {
        code: number;
        name: string;
        description: string;
    };
    3002: {
        code: number;
        name: string;
        description: string;
    };
    3003: {
        code: number;
        name: string;
        description: string;
    };
    3050: {
        code: number;
        name: string;
        description: string;
    };
};
export declare enum CLOSE_EVENT_CODE {
    NormalClosure = 1000,
    GoingAway = 1001,
    ProtocolError = 1002,
    UnsupportedData = 1003,
    NoStatusReceived = 1005,
    AbnormalClosure = 1006,
    InvalidFramePayloadData = 1007,
    PolicyViolation = 1008,
    MessageTooBig = 1009,
    MissingExtension = 1010,
    InternalError = 1011,
    ServiceRestart = 1012,
    TryAgainLater = 1013,
    BadGateway = 1014,
    TLSHandshake = 1015,
    ReconnectWebSocket = 3000,
    NoRealtimeListeners = 3001,
    HeartbeatPingError = 3002,
    HeartbeatPongTimeoutError = 3003,
    NoAuthentication = 3050
}
export declare const getWSCloseError: (code: CLOSE_EVENT_CODE, reason?: string) => CloudSDKError;
