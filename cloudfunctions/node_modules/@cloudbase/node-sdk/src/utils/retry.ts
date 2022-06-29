import retry from 'retry'
// import { RetryOperation } from 'retry/lib/retry_operation'
const RetryOperation = require('retry/lib/retry_operation')

/* istanbul ignore next */
function defaultShouldRetry(e: any, result: any) {
    return { retryAble: false, message: '' }
}

export interface IRetryOptions {
    // TimeoutsOptions
    retries?: number
    // CreateTimeoutOptions
    factor?: number
    minTimeout?: number
    maxTimeout?: number
    randomize?: boolean

    // OperationOptions
    forever?: boolean
    unref?: boolean
    maxRetryTime?: number

    // AttemptTimeoutOptions
    timeoutOps?: any

    // SelfDefined
    timeouts?: [number]

    // SelfDefined
    shouldRetry?: (e: any, result: any, operation: any) => { retryAble: boolean; message: string }
}

/**
 * withRetry 重试封装函数
 * @param fn
 * @param retryOptions
 */
/* istanbul ignore next */
export function withRetry<T>(
    fn: (attempts?: number) => Promise<T>,
    retryOptions: IRetryOptions
): Promise<T> {
    // 默认不重试，0 表达未开启的含义，所以直接返回 promise
    if (!retryOptions || retryOptions.retries === 0) {
        return fn()
    }

    // 默认重试策略采取指数退避策略，超时时间计算公式及参数可查文档
    // https://github.com/tim-kos/node-retry/
    // 自定重试时间：
    // timeouts: [1000, 2000, 4000, 8000]
    const timeouts = retryOptions.timeouts
        ? [...retryOptions.timeouts]
        : retry.timeouts(retryOptions)
    const operation = new RetryOperation(timeouts, {
        forever: retryOptions.forever, // 是否永远重试，默认 false
        unref: retryOptions.unref, // 定时器是否脱离事件循环
        maxRetryTime: retryOptions.maxRetryTime // 重试总的时间，单位毫秒，默认：Infinity
    })

    const shouldRetry = retryOptions.shouldRetry || defaultShouldRetry
    return new Promise((resolve, reject) => {
        const isReadyToRetry = (e, resp, operation) => {
            // 外层有效识别需要或者能够进行重试
            // shouldRetry 中可调用 operation.stop 停掉重试，operation.retry 返回 false
            const { retryAble, message } = shouldRetry(e, resp, operation)

            const info: any = {}
            info.nth = operation.attempts()
            info.at = new Date()
            info.message = message
            // 双重条件判断是否重试，外层判断满足条件与否，还需判断是否满足再次重试条件
            const readyToRetry = retryAble && operation.retry({ ...info })
            if (!readyToRetry) {
                // 如果不准备进行重试，并且尝试不止一次
                // 最后一个错误记录重试信息
                const ref = e || resp
                if (ref && operation.attempts() > 1) {
                    ref.attempt = {}
                    ref.attempt.timeouts = operation._originalTimeouts
                    ref.attempt.attempts = operation.attempts()
                    ref.attempt.errors = operation.errors()
                    // 如果最后一次因为 !retryAble 而没有进行重试
                    // ref.attempt.errors 中将缺少最后的这个错误
                    // ref.attempt.errors 中包含最后一次错误信息
                    if (!retryAble) {
                        ref.attempt.errors.push(info)
                    }
                }
            }
            return readyToRetry
        }

        operation.attempt(async () => {
            try {
                const result: any = await fn(operation.attempts())
                if (!isReadyToRetry(null, result, operation)) {
                    resolve(result)
                }
            } catch (e) {
                try {
                    if (!isReadyToRetry(e, null, operation)) {
                        reject(e)
                    }
                } catch (e) {
                    reject(e)
                }
            }
        }, retryOptions.timeoutOps)
    })
}
