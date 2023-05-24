import http from 'http'
import request from 'request'
import { IReqOpts } from '../type/index'
import { withRetry, IRetryOptions } from './retry'
import { RequestTimgingsMeasurer } from './request-timings-measurer'
import HttpKeepAliveAgent, { HttpsAgent as HttpsKeepAliveAgent } from 'agentkeepalive'

const SAFE_RETRY_CODE_SET = new Set([
    'ENOTFOUND',
    'ENETDOWN',
    'EHOSTDOWN',
    'ENETUNREACH',
    'EHOSTUNREACH',
    'ECONNREFUSED'
])

const RETRY_CODE_SET = new Set(['ECONNRESET', 'ESOCKETTIMEDOUT'])

const RETRY_STATUS_CODE_SET = new Set([])

/* istanbul ignore next */
function shouldRetry(e: any, result: any, operation: any) {
    // 重试的错误码
    if (e && SAFE_RETRY_CODE_SET.has(e.code)) {
        return {
            retryAble: true,
            message: e.message
        }
    }
    // 连接超时
    if (e && e.code === 'ETIMEDOUT' && e.connect === true) {
        return {
            retryAble: true,
            message: e.message
        }
    }
    // 重试的状态码
    if (result && RETRY_STATUS_CODE_SET.has(result.statusCode)) {
        return {
            retryAble: true,
            message: `${result.request.method} ${result.request.href} ${result.statusCode} ${
                http.STATUS_CODES[result.statusCode]
            }`
        }
    }
    return {
        retryAble: false,
        message: ''
    }
}

interface ITimingsMeasurerOptions {
    waitingTime?: number
    interval?: number
    enable?: boolean
}

interface IExtraRequestOptions {
    debug?: boolean
    op?: string
    seqId?: string
    attempts?: number
    timingsMeasurerOptions?: ITimingsMeasurerOptions
    retryOptions?: IRetryOptions
}

/* istanbul ignore next */
export function requestWithTimingsMeasure(opts: IReqOpts, extraOptions?: IExtraRequestOptions) {
    return new Promise((resolve, reject) => {
        const timingsMeasurerOptions: ITimingsMeasurerOptions =
            extraOptions.timingsMeasurerOptions || {}
        const {
            waitingTime = 1000,
            interval = 200,
            enable = !!extraOptions.debug
        } = timingsMeasurerOptions

        const timingsMeasurer = RequestTimgingsMeasurer.new({
            waitingTime,
            interval,
            enable
        })

        timingsMeasurer.on('progress', (timings: any, reason = '') => {
            const timingsLine = `s:${timings.socket || '-'}|l:${timings.lookup ||
                '-'}|c:${timings.connect || '-'}|r:${timings.ready || '-'}|w:${timings.waiting ||
                '-'}|d:${timings.download || '-'}|e:${timings.end || '-'}|E:${timings.error || '-'}`
            console.warn(
                `[RequestTimgings][${extraOptions.op || ''}] spent ${Date.now() -
                    timings.start}ms(${timingsLine}) [${
                    extraOptions.seqId
                }][${extraOptions.attempts || 1}][${reason}]`
            )
        })

        if (opts.keepalive) {
            ;(opts as any).agentClass = opts.url.startsWith('https')
                ? HttpsKeepAliveAgent
                : HttpKeepAliveAgent
            ;(opts as any).agentOptions = {
                // keepAlive: true,
                keepAliveMsecs: 3000,
                maxSockets: 100,
                maxFreeSockets: 10,
                freeSocketTimeout: 20000,
                timeout: 20000,
                socketActiveTTL: null
            }
        }

        ;(function r(times?: number) {
            const clientRequest = request(opts, function(err, response, body) {
                const reusedSocket = !!(clientRequest && clientRequest.req && clientRequest.req.reusedSocket)
                if (err && extraOptions.debug) {
                    console.warn(`[RequestTimgings][keepalive:${opts.keepalive}][reusedSocket:${reusedSocket}][times:${times}][code:${err.code}][message:${err.message}]${opts.url}`)
                }
                if (err && err.code === 'ECONNRESET' && reusedSocket && times >= 0 && opts.keepalive) {
                    return r(--times)
                }
                return err ? reject(err) : resolve(response)
            })

            if (
                (request.Request && clientRequest instanceof request.Request) ||
                clientRequest instanceof http.ClientRequest
            ) {
                timingsMeasurer.measure(clientRequest)
            }
        }(1))
    })
}

export function extraRequest(opts: IReqOpts, extraOptions?: IExtraRequestOptions) {
    if (extraOptions && extraOptions.retryOptions) {
        return withRetry(
            attempts => {
                return requestWithTimingsMeasure(opts, { ...extraOptions, attempts })
            },
            { shouldRetry, ...extraOptions.retryOptions }
        )
    } else {
        return requestWithTimingsMeasure(opts, { ...extraOptions, attempts: 1 })
    }
}
