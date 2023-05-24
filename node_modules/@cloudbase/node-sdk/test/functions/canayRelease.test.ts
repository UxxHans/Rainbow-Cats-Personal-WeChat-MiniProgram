import config from '../config.local'
import Tcb from '../../src/index'

// 云函数调用云函数，需要在SDK透传routekey等灰度发布参数

// - 数据流调用云函数时注入 TCB_ROUTE_KEY 变量
// - SDK 读取云函数中的 TCB_ROUTE_KEY 变量
// - SDK 调用数据流服务时带上 routeKey 参数，没有时不传
// - 数据流服务判断有 routeKey 时使用该 routeKey

jest.mock('request')

describe.skip('函数支持灰度发布功能', () => {
    const app = Tcb.init(config)

    it('无 TCB_ROUTE_KEY 等灰度发布环境变量时调用云函数不透传 X-Tcb-Route-Key header参数', async function () {
        process.env.TCB_ROUTE_KEY = ''
        process.env.TCB_CONTEXT_KEYS = 'TCB_ROUTE_KEY'

        const mockedRequest = require('request')
        // mockedRequest.mockClear()

        app.callFunction({
            name: 'test',
            data: { a: 1 }
        })

        return new Promise(resolve => {
            setImmediate(() => {
                expect(mockedRequest).toBeCalled()
                expect(mockedRequest.mock.calls[0][0].headers).not.toHaveProperty('X-Tcb-Route-Key')
                expect(mockedRequest.mock.calls[0][0].headers['X-Tcb-Route-Key']).toBe(undefined)
                resolve()
            })
        })
    })

    it('存在 TCB_ROUTE_KEY 等灰度发布相关变量时透传 X-Tcb-Route-Key header参数', async function () {
        const randomRouteKey = String(Math.floor(Math.random() * 100) + 1)
        process.env.TCB_ROUTE_KEY = randomRouteKey
        process.env.TCB_CONTEXT_KEYS = 'TCB_ROUTE_KEY'

        const mockedRequest = require('request')
        mockedRequest.mockClear()

        app.callFunction({
            name: 'test',
            data: { a: 1 }
        })

        return new Promise(resolve => {
            setImmediate(() => {
                expect(mockedRequest).toBeCalled()
                expect(mockedRequest.mock.calls[0][0].headers['X-Tcb-Route-Key']).toBe(
                    randomRouteKey
                )
                resolve()
            })
        })
    })
})
