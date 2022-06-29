"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const request_1 = __importDefault(require("request"));
const retry_1 = require("./retry");
const request_timings_measurer_1 = require("./request-timings-measurer");
const agentkeepalive_1 = __importStar(require("agentkeepalive"));
const SAFE_RETRY_CODE_SET = new Set([
    'ENOTFOUND',
    'ENETDOWN',
    'EHOSTDOWN',
    'ENETUNREACH',
    'EHOSTUNREACH',
    'ECONNREFUSED'
]);
const RETRY_CODE_SET = new Set(['ECONNRESET', 'ESOCKETTIMEDOUT']);
const RETRY_STATUS_CODE_SET = new Set([]);
/* istanbul ignore next */
function shouldRetry(e, result, operation) {
    // 重试的错误码
    if (e && SAFE_RETRY_CODE_SET.has(e.code)) {
        return {
            retryAble: true,
            message: e.message
        };
    }
    // 连接超时
    if (e && e.code === 'ETIMEDOUT' && e.connect === true) {
        return {
            retryAble: true,
            message: e.message
        };
    }
    // 重试的状态码
    if (result && RETRY_STATUS_CODE_SET.has(result.statusCode)) {
        return {
            retryAble: true,
            message: `${result.request.method} ${result.request.href} ${result.statusCode} ${http_1.default.STATUS_CODES[result.statusCode]}`
        };
    }
    return {
        retryAble: false,
        message: ''
    };
}
/* istanbul ignore next */
function requestWithTimingsMeasure(opts, extraOptions) {
    return new Promise((resolve, reject) => {
        const timingsMeasurerOptions = extraOptions.timingsMeasurerOptions || {};
        const { waitingTime = 1000, interval = 200, enable = !!extraOptions.debug } = timingsMeasurerOptions;
        const timingsMeasurer = request_timings_measurer_1.RequestTimgingsMeasurer.new({
            waitingTime,
            interval,
            enable
        });
        timingsMeasurer.on('progress', (timings, reason = '') => {
            const timingsLine = `s:${timings.socket || '-'}|l:${timings.lookup ||
                '-'}|c:${timings.connect || '-'}|r:${timings.ready || '-'}|w:${timings.waiting ||
                '-'}|d:${timings.download || '-'}|e:${timings.end || '-'}|E:${timings.error || '-'}`;
            console.warn(`[RequestTimgings][${extraOptions.op || ''}] spent ${Date.now() -
                timings.start}ms(${timingsLine}) [${extraOptions.seqId}][${extraOptions.attempts || 1}][${reason}]`);
        });
        if (opts.keepalive) {
            ;
            opts.agentClass = opts.url.startsWith('https')
                ? agentkeepalive_1.HttpsAgent
                : agentkeepalive_1.default;
            opts.agentOptions = {
                // keepAlive: true,
                keepAliveMsecs: 3000,
                maxSockets: 100,
                maxFreeSockets: 10,
                freeSocketTimeout: 20000,
                timeout: 20000,
                socketActiveTTL: null
            };
        }
        ;
        (function r(times) {
            const clientRequest = request_1.default(opts, function (err, response, body) {
                const reusedSocket = !!(clientRequest && clientRequest.req && clientRequest.req.reusedSocket);
                if (err && extraOptions.debug) {
                    console.warn(`[RequestTimgings][keepalive:${opts.keepalive}][reusedSocket:${reusedSocket}][times:${times}][code:${err.code}][message:${err.message}]${opts.url}`);
                }
                if (err && err.code === 'ECONNRESET' && reusedSocket && times >= 0 && opts.keepalive) {
                    return r(--times);
                }
                return err ? reject(err) : resolve(response);
            });
            if ((request_1.default.Request && clientRequest instanceof request_1.default.Request) ||
                clientRequest instanceof http_1.default.ClientRequest) {
                timingsMeasurer.measure(clientRequest);
            }
        }(1));
    });
}
exports.requestWithTimingsMeasure = requestWithTimingsMeasure;
function extraRequest(opts, extraOptions) {
    if (extraOptions && extraOptions.retryOptions) {
        return retry_1.withRetry(attempts => {
            return requestWithTimingsMeasure(opts, Object.assign({}, extraOptions, { attempts }));
        }, Object.assign({ shouldRetry }, extraOptions.retryOptions));
    }
    else {
        return requestWithTimingsMeasure(opts, Object.assign({}, extraOptions, { attempts: 1 }));
    }
}
exports.extraRequest = extraRequest;
