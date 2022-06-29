import tcb from '../../src/index'
import assert from 'assert'
import config from '../config.local'
import { ERROR } from '../../lib/const/code'

// TODO 删除前先创建
describe('wx.openApi: 微信openapi', () => {
    const app = tcb.init(config)

    it('传参JSON.stringify报错', async () => {
        let a: any = {}
        let b: any = {}
        a.c = b
        b.c = a
        let result
        try {
            result = await app.callWxOpenApi({
                apiName: '/inner/svrkitclientcall',
                requestData: a
            })
        } catch (e) {
            assert(e.code === ERROR.INVALID_PARAM.code)
        }
    })

    it('微信openapi', async () => {
        try {
            let result = await app.callWxOpenApi({
                apiName: '/inner/svrkitclientcall',
                requestData: { name: 'jamespeng' }
            })
        } catch (e) {
            assert(e.code === ERROR.INVALID_PARAM.code)
        }
        // assert(result.result, '微信openapi失败');
    }, 30000)

    it('微信new openapi', async () => {
        try {
            let result = await app.callCompatibleWxOpenApi({
                apiName: '/AAA/BBB/sample',
                requestData: Buffer.from(JSON.stringify({ name: 'jamespeng' }))
            })
        } catch (e) {
            assert(e.code === ERROR.INVALID_PARAM.code)
        }
        // console.log(result)
        // assert(result.result, '微信openapi失败');
    }, 30000)

    it('mock callCompatibleWxOpenApi return', async () => {
        jest.resetModules()
        jest.mock('request', () => {
            return jest.fn().mockImplementation((params, callback) => {
                const body = { data: { name: 'luke' } }
                process.nextTick(() => {
                    callback(null, { req: {reusedSocket: false}, statusCode: 200, body })
                })
            })
        })

        const tcb1 = require('../../src/index')
        const app1 = tcb1.init(config)

        const res = await app1.callCompatibleWxOpenApi({
            apiName: '/AAA/BBB/sample',
            requestData: Buffer.from(JSON.stringify({ name: 'jamespeng' }))
        })
        assert.ok(res.data.name === 'luke')
    })

    // mock callWxOpenApi 回包为string
    it('微信openapi mock回包为string', async () => {
        jest.resetModules()
        jest.mock('request', () => {
            return jest.fn().mockImplementation((params, callback) => {
                const body = { data: { responseData: 'test' } }
                process.nextTick(() => {
                    callback(null, { req: {reusedSocket: false}, statusCode: 200, body })
                })
            })
        })

        const tcb1 = require('../../src/index')
        const app1 = tcb1.init(config)
        try {
            let result = await app1.callWxOpenApi({
                apiName: '/inner/svrkitclientcall',
                requestData: { name: 'jamespeng' }
            })
            // console.log(result)
            assert(typeof result.result === 'string')
        } catch (err) {
            // assert(err.code === 'STORAGE_REQUEST_FAIL')
            console.log(err)
        }
    })

    it('微信 wxPayApi', async () => {
        try {
            let result = await app.callWxPayApi({
                apiName: 'cloudPay.getRefundStatus',
                requestData: Buffer.from(JSON.stringify({ api: 'getRefundStatus', data: {} }))
            })
        } catch (e) {
            assert(e.code === ERROR.INVALID_PARAM.code)
        }
        // console.log(result)
        // assert(result.result, '微信openapi失败');
    }, 30000)

    it('mock callWxOpenApi code', async () => {
        jest.resetModules()
        jest.mock('request', () => {
            return jest.fn().mockImplementation((params, callback) => {
                const body = { code: 'mockCode', message: 'mockMessage' }
                process.nextTick(() => {
                    callback(null, { req: {reusedSocket: false}, statusCode: 200, body })
                })
            })
        })

        const tcb1 = require('../../src/index')
        const app1 = tcb1.init(config)

        expect(
            app1.callWxOpenApi({
                apiName: 'cloudPay.getRefundStatus',
                requestData: { name: 'luke' }
            })
        ).rejects.toThrow(new Error('mockMessage'))

        const app2 = tcb1.init({
            ...config,
            throwOnCode: false
        })
        const res = await app2.callWxOpenApi({
            apiName: 'cloudPay.getRefundStatus',
            requestData: { name: 'luke' }
        })
        assert(res.code === 'mockCode')
    })

    it('getCrossAccountInfo err', async () => {
        expect(
            app.callWxOpenApi(
                {
                    apiName: 'cloudPay.getRefundStatus',
                    requestData: { name: 'luke' }
                },
                {
                    getCrossAccountInfo: 'test'
                }
            )
        ).rejects.toThrow(new Error('invalid config: getCrossAccountInfo'))
    })
})
