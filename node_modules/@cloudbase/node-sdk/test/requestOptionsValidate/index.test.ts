// 校验各种设置config ，入参是否正确

import tcb from '../../src/index'
import assert from 'assert'
import config from '../config.local'
import url from 'url'

beforeEach(async () => {
    jest.resetModules()
    jest.resetAllMocks()
})

afterEach(async () => {
    jest.resetModules()
    jest.resetAllMocks()
})

// TODO 删除前先创建
describe('校验config设置  请求入参', () => {
    const app = tcb.init(config)

    it('config retries', async () => {
        const tcb = require('../../src/index')
        const app = tcb.init({
            ...config,
            retries: 3
        })
        const res = await app.callFunction({
            name: 'test',
            data: {}
        })
        assert.ok(res.result === 'hello')
    })

    it('config forever', async () => {
        const tcb = require('../../src/index')

        const app = tcb.init({
            ...config,
            forever: true
        })
        const res = await app.callFunction({
            name: 'test',
            data: {}
        })
        assert.ok(res.result === 'hello')
    })

    it('request retryOptions', async () => {
        const tcb = require('../../src/index')
        const app = tcb.init({
            ...config
        })
        const res = await app.callFunction(
            {
                name: 'test',
                data: {}
            },
            {
                retryOptions: {
                    retries: 3
                }
            }
        )
        assert.ok(res.result === 'hello')
    })

    it('微信openapi', async () => {
        try {
            let result = await app.callWxOpenApi({
                apiName: '/inner/svrkitclientcall',
                requestData: { name: 'jamespeng' }
            })
        } catch (e) {
            assert(e.code === 'INVALID_PARAM')
        }
    }, 30000)

    it('微信new openapi', async () => {
        try {
            let result = await app.callCompatibleWxOpenApi({
                apiName: '/AAA/BBB/sample',
                requestData: Buffer.from(JSON.stringify({ name: 'jamespeng' }))
            })
        } catch (e) {
            assert(e.code === 'INVALID_PARAM')
        }
        // assert(result.result, '微信openapi失败');
    }, 30000)

    it('校验config.isHttp => protocol', async () => {
        jest.mock('../../src/utils/request', () => {
            return {
                extraRequest: jest.fn().mockImplementation(opts => {
                    return Promise.resolve({
                        statusCode: 200,
                        body: {
                            data: { response_data: opts },
                            requestId: 'testRequestId'
                        }
                    })
                })
            }
        })

        const tcb = require('../../src/index')
        let app = null
        let mockReqRes = null
        
        app = tcb.init({
            ...config,
            isHttp: true
        })

        // mock一次http请求
        mockReqRes = await app.callFunction({
            name: 'unexistFunction',
            data: { a: 1 }
        })

        assert(mockReqRes.result.url.indexOf('https') < 0)

        app = tcb.init({
            ...config,
            isHttp: false
        })

        // mock一次https请求
        mockReqRes = await app.callFunction({
            name: 'unexistFunction',
            data: { a: 1 }
        })

        assert(mockReqRes.result.url.indexOf('https') >= 0)
    })

    it('校验 parseContext 后 url', async () => {
        jest.mock('../../src/utils/request', () => {
            return {
                extraRequest: jest.fn().mockImplementation(opts => {
                    return Promise.resolve({
                        statusCode: 200,
                        body: {
                            data: { response_data: opts },
                            requestId: 'testRequestId'
                        }
                    })
                })
            }
        })
        const mockContext = {
            memory_limit_in_mb: 256,

            time_limit_in_ms: 3000,

            request_id: '3169444b-25f4-11ea-81e5-525400235f2a',

            environ:
                'WX_CLIENTIP=10.12.23.71;WX_CLIENTIPV6=::ffff:10.12.23.71;WX_APPID=wx5ceb4e4809aa1d28;WX_OPENID=oaEk445grItIBpFcJ3eRBCb6yx8g;WX_API_TOKEN=eyJWZXJzaW9uIjoxLCJLZXlWZXJzaW9uIjo4MSwiZXZlbnRJZCI6IkhFeXJYb0hrQjVDLW1OWk1JWkx3N29hNHNoZU9uMEtfNlhuM1FEb2Y0NFV6LVRJRWtyNkZSbUZ3SDhQLWNiS1dETWtyTTZ2Qm1MNXRodjR4SGgycDhXLU1sUzY1Q19uc2FiWmVaTUFpN3c4SktRIiwidGlja2V0IjoiQ0VVU2dBUSsxUzlqWnRHa0ZGenQwTmp4VENCWkM3dHp5M3Vxa252b1pqanFleUY0WEJ1WG1VMElQUGFQZElDYUlkOWxYZGZ5YUxSN3MxR3F3a3NKSEdLb3c2K1FRVGF4cWhZYlJYT3doRWVWYXEya3VGVUxmQWt4TlpKUlFvd2lBNUJsbm8zRDlaOFNZandtRUFtRG1ITitBN3lFRG40Y2NhcHh1OFdjV3N6Tjc3Rkt0WmE2czhadmNTNW9zTmlXcXU5dWRDeEszb05jM3ZuNFdtS2VOcVRqN1BWcWZJUWhMWmhKNmFxbDIvSGdONXhCRkdFaUI1RmtYVEdJUnc0TmxzYTlMUmZ5enp1dDZSazRrVTBUZ3RrOFV3S1dyS1ZKbktoSFg3WEJTSXN1SlF1VDdUL0tzL0JuS1BsM3FNZVdmeGlrKzY1K3VpSTZZb1VyMm9NUlExek11NzVKWVNDaGFGRmxYZWZFeDVBelY1TWF4QUczVHRSL2JhNGhocDZUUjE5ZlNlcVRGTUJjNUh4NXBlUzVWbkVGYWRDdTRZZS9rT0RxZW5xZCtxbnlvYjZNbXFLa0F3VkdXVzRYZ2VVNkZXSnM5Mzl5OFpGRTU1dWpVT0lNWmVDZ1VvNi9Bb201VHFxSXJvK25rK2hCUGh0L1lJVTZMU25INkVVWWtZVXhHZzJKOTBaTDFKZThFN0ZYZzFSQjFyenJGS2NsZEJndVVLWDFxVlBtWExRNndhdWpOcHpneDBNaGZvVENrenhVaWJEdWRqMlAyeG9tNlQ5L3VaM0FON1ZNeEJwckVKTzVQMDZndDV0SElCOXRxK1NPM01pVjluQk03UCtRendhVEJ6eUx6OThGUzBwSVhTdHYyYU9YMzhiZE1FVkpkQkkrUTJ1NW0xWmNENW9kODQ3UnlBPT0ifQ==;WX_CONTEXT_KEYS=WX_CLIENTIP,WX_CLIENTIPV6,WX_APPID,WX_OPENID,WX_API_TOKEN;TCB_ENV=luke-87pns;TCB_SEQID=1577153917182_0.13161529658114857_33555268;TRIGGER_SRC=tcb;TCB_SESSIONTOKEN=pNNA4UPZHja3ngOjkBJbPFCyNvL9twqf0931632f99099b88fdc6ae3e119dc84dsO99eZ7w6rzsbeh4Zf7bDQDns1glEZ761vFBDajV1ijUp-Sj-l59rfLi_s1TdYiA82HjIJzbVKnKEHzuFLJlonOIYd_NFnkQJw4MB0L6vYLcmDYYMzEhrByAddagrSdoxux6vwHfJ4B0tzzajmcXqFKkowDZJn5ZZBX1I-Sta1nfoX73qTCqlUWPAAhkhECa81LSvZrFTfsvZyLOOAvevK_kP5qy2zeYKgQtb9IvHI1xmOSj0AaTIiuqOce5i4_kLu5_Z9Gqqxc1PS2oimkhWRqL79E-sW-fF3HpuGD01W832B2wn9W3vpaKi50lyN2gAyKW3Wf0ASA_vPVyZziR20fkmfmThrrBnLgGYd-FPAk;TCB_SOURCE=wx_devtools;TCB_CONTEXT_KEYS=TCB_ENV,TCB_SEQID,TRIGGER_SRC,TCB_SESSIONTOKEN,TCB_SOURCE;TENCENTCLOUD_SECRETID=AKIDDtm4yzucNcl_lE7IixiQO5aTdd4eBnut0eOk6Br82dnMsx5hg2ZEzBWtxUcUWcjO;TENCENTCLOUD_SECRETKEY=cEh6rsAFJTIeue3REKZQUHdQTTVJKhZmOb1EPLLPhSA=;TENCENTCLOUD_SESSIONTOKEN=DnAZAXuXDmPY87R0UWZMQ4JTIr6SeqpU1eb1faab03564a897dd3fc31dcc3d348GxhExs-XtxXU-g6pm7sXBpGwkJzRcEyYQHnnB6AONAbRfbphlIm-BfGhdXY2RQeEj7UiOWKTw1_VliMk8HIhgNYRZx0Ue6KXiNUneMvX5SgOOOToOCM2-YJTh6oYj1NhoLaefxPRf8TQ72yLWTagRh0x9IaTtpp6jrJFR7lBA26JLgATRnGJRw-iO2HNMCDSSVVT_VnhO46JGGUdEjfBCzs-6uU0jTSlE_Q7EKOt9_4N3a6JfzCxsJQV8IebfZXcTcVqjefiIHZyNGv71-GUbpfHhhfy_EhPlRJsDnvCByiqsM3celEvf86LtIBI-m2Tbae-K069lu5wC3_PFxC_5hjvIiTpfiQW2wEKwlSuklQ;SCF_NAMESPACE=luke-87pns',

            function_version: '$LATEST',

            function_name: 'login',

            namespace: 'luke-87pns'
        }
        const tcb = require('../../src/index')

        tcb.parseContext(mockContext)

        const app = tcb.init(config)

        // mock一次http请求
        let mockReqRes = await app.callFunction({
            name: 'unexistFunction',
            data: { a: 1 }
        })

        let reqOpts = mockReqRes.result

        console.log('reqOpts.url:', reqOpts.url)
        // assert(reqOpts.url.indexOf('https') < 0)
        const myURL = url.parse(reqOpts.url, true)
        assert.ok(myURL.query.scfRequestId === '3169444b-25f4-11ea-81e5-525400235f2a')
    })

    it('校验传入url 带?', async () => {
        jest.mock('../../src/utils/request', () => {
            return {
                extraRequest: jest.fn().mockImplementation(opts => {
                    return Promise.resolve({
                        statusCode: 200,
                        body: {
                            data: { response_data: opts },
                            requestId: 'testRequestId'
                        }
                    })
                })
            }
        })
        const tcb = require('../../src/index')
        let app = tcb.init({
            ...config,
            serviceUrl: 'http://testUrl.test.com?'
        })

        // mock一次http请求
        let mockReqRes = await app.callFunction({
            name: 'unexistFunction',
            data: { a: 1 }
        })

        let reqOpts = mockReqRes.result
        // console.log(reqOpts.url)
        const matchNum = reqOpts.url.match(/\?/g)
        // console.log(matchNum)
        assert(matchNum.length === 1)
    })

    it('校验config.version => x-sdk-version config.serviceUrl => url', async () => {
        config.version = 'test-version'
        config.serviceUrl = 'http://testUrl.test.com'

        jest.mock('../../src/utils/request', () => {
            return {
                extraRequest: jest.fn().mockImplementation(opts => {
                    return Promise.resolve({
                        statusCode: 200,
                        body: {
                            data: { response_data: opts },
                            requestId: 'testRequestId'
                        }
                    })
                })
            }
        })
        const tcb = require('../../src/index')
        let app = tcb.init(config)

        // mock一次http请求
        let mockReqRes = await app.callFunction({
            name: 'unexistFunction',
            data: { a: 1 }
        })

        let reqOpts = mockReqRes.result
        assert(reqOpts.headers['X-SDK-Version'] === config.version)
        assert(reqOpts.url.indexOf('http://testUrl.test.com') === 0)
    })

    it('校验云函数or容器环境 请求url', async () => {
        process.env.TENCENTCLOUD_RUNENV = 'SCF'
        process.env.TENCENTCLOUD_REGION = 'ap-shanghai'
        process.env.KUBERNETES_SERVICE_HOST = 'KUBERNETES_SERVICE_HOST'
        jest.mock('../../src/utils/request', () => {
            return {
                extraRequest: jest.fn().mockImplementation(opts => {
                    return Promise.resolve({
                        statusCode: 200,
                        body: {
                            data: { response_data: opts },
                            requestId: 'testRequestId'
                        }
                    })
                })
            }
        })

        const tcb = require('../../src/index')
        const config = require('../../test/config.local')
        let app = tcb.init(config)

        // mock一次http请求
        let mockReqRes = await app.callFunction({
            name: 'unexistFunction',
            data: { a: 1 }
        })

        let reqOpts = mockReqRes.result
        assert(reqOpts.url.indexOf('internal') >= 0)
        process.env.TENCENTCLOUD_RUNENV = ''
        process.env.TENCENTCLOUD_REGION = ''
        process.env.KUBERNETES_SERVICE_HOST = ''
    })

    it('校验config.serviceUrl => url', async () => {
        config.serviceUrl = 'http://testUrl.com'
        jest.mock('../../src/utils/request', () => {
            return {
                extraRequest: jest.fn().mockImplementation(opts => {
                    return Promise.resolve({
                        statusCode: 200,
                        body: {
                            data: { response_data: opts },
                            requestId: 'testRequestId'
                        }
                    })
                })
            }
        })
        const tcb = require('../../src/index')
        let app = tcb.init(config)

        // mock一次http请求
        let mockReqRes = await app.callFunction({
            name: 'unexistFunction',
            data: { a: 1 }
        })

        let reqOpts = mockReqRes.result
        assert(reqOpts.url.indexOf('testUrl') >= 0)
    })

    // mock callWxOpenApi 回包为string
    it('微信openapi mock回包为string', async () => {
        jest.resetModules()
        jest.mock('request', () => {
            return {
                extraRequest: jest.fn().mockImplementation(params => {
                    return Promise.resolve({
                        statusCode: 200,
                        body: {
                            data: { response_data: 'test' },
                            requestId: 'testRequestId'
                        }
                    })
                })
            }
        })

        const tcb1 = require('../../src/index')
        const app1 = tcb1.init(config)
        try {
            let result = await app1.callWxOpenApi({
                apiName: '/inner/svrkitclientcall',
                requestData: { name: 'jamespeng' }
            })
            // assert(typeof result.result === 'string')
        } catch (err) {
            // assert(err.code === 'STORAGE_REQUEST_FAIL')
            console.log(err)
        }
    })
})
