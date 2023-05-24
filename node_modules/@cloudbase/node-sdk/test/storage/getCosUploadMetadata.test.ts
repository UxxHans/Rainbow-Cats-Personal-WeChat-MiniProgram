// jest.resetModules()

import assert from 'assert'
import config from '../config.local'
import fs from 'fs'
import path from 'path'
import tcb from '../../src/index'
import xml2js from 'xml2js'
import { ERROR } from '../../lib/const/code'

describe('storage.uploadFile: 上传文件', () => {
    beforeEach(async () => {
        jest.resetModules()
        jest.resetAllMocks()
    })

    const app = tcb.init(config)

    it('mock getUploadMetadata报错', async () => {
        // jest.resetModules()
        // mock错误
        jest.mock('request', () => {
            return jest.fn().mockImplementation((params, callback) => {
                const body = { code: 'STORAGE_EXCEED_AUTHORITY' }
                process.nextTick(() => {
                    callback(null, { statusCode: 200, body })
                })
            })
        })

        const tcb1 = require('../../src/index')
        const app1 = tcb1.init(config)
        try {
            let result = await app1.getUploadMetadata({
                // cloudPath: "test-admin.jpeg",
                cloudPath: '11112.png'
            })
        } catch (err) {
            assert(err.code === 'STORAGE_EXCEED_AUTHORITY')
        }
    }, 30000)

    it('mock uploadFile SignatureDoesNotMatch 报错', async () => {
        // mock错误
        jest.mock('request', () => {
            function mockRequest1(params, callback) {
                const body = { data: {} }
                process.nextTick(() => {
                    callback(null, { statusCode: 200, body })
                })
            }

            function mockRequest2(params, callback) {
                const obj = {
                    Error: {
                        Code: 'SignatureDoesNotMatch',
                        Message: ''
                    }
                }

                const builder = new xml2js.Builder()
                const xml = builder.buildObject(obj)

                callback(null, { body: xml }, xml)
            }

            let mR
            let i = 0

            return jest.fn().mockImplementation((params, callback) => {
                // if(!mR) {
                //   mR = mockRequest(params, callback)
                // }

                if (i === 0) {
                    mockRequest1(params, callback)
                } else {
                    mockRequest2(params, callback)
                }
                i++
                // return mR.next()
            })
        })

        const tcb2 = require('../../src/index')
        const app2 = tcb2.init(config)

        try {
            const result1 = await app2.uploadFile({
                cloudPath: '测试.png',
                fileContent: 'test'
            })
            // console.log(result1)
        } catch (err) {
            assert(err.code === ERROR.SYS_ERR.code)
        }
    }, 100000)

    it('mock getUploadMetadata request err 报错', async () => {
        // jest.resetModules()
        // mock错误
        jest.mock('request', () => {
            return jest.fn().mockImplementation((params, callback) => {
                process.nextTick(() => {
                    callback({ code: 'testError' }, { statusCode: 200, body: {} })
                })
            })
        })

        const tcb3 = require('../../src/index')
        const app3 = tcb3.init(config)
        try {
            let result = await app3.uploadFile({
                cloudPath: '测试.png',
                fileContent: 'test'
            })
        } catch (err) {
            assert(err.code === 'testError')
        }
    }, 30000)

    it('mock uploadFile request 报错', async () => {
        // mock错误
        jest.mock('request', () => {
            function mockRequest1(params, callback) {
                process.nextTick(() => {
                    callback(null, { statusCode: 200, body: { data: {} } })
                })
            }

            function mockRequest2(params, callback) {
                callback({ code: 'testErr' }, null, null)
            }

            let mR
            let i = 0

            return jest.fn().mockImplementation((params, callback) => {
                if (i === 0) {
                    mockRequest1(params, callback)
                } else {
                    mockRequest2(params, callback)
                }
                i++
            })
        })

        const tcb4 = require('../../src/index')
        const app4 = tcb4.init(config)

        try {
            const result1 = await app4.uploadFile({
                cloudPath: '测试.png',
                fileContent: 'test'
            })
        } catch (err) {
            assert(err.code === 'testErr')
        }
    }, 30000)

    it('mock parseXML 报错', async () => {
        // mock错误
        jest.mock('request', () => {
            function mockRequest1(params, callback) {
                process.nextTick(() => {
                    callback(null, { statusCode: 200, body: { data: {} } })
                })
            }

            function mockRequest2(params, callback) {
                // const obj = {Error:{
                //   Code: 'SignatureDoesNotMatch',
                //   Message: ''
                // }}

                // const builder = new xml2js.Builder();
                // const xml = builder.buildObject('ERROR');
                process.nextTick(() => {
                    callback(null, { body: 'ERROR' }, 'ERROR')
                })
            }

            let mR
            let i = 0

            return jest.fn().mockImplementation((params, callback) => {
                // if(!mR) {
                //   mR = mockRequest(params, callback)
                // }

                if (i === 0) {
                    mockRequest1(params, callback)
                } else {
                    mockRequest2(params, callback)
                }
                i++
                // return mR.next()
            })
        })

        const tcb5 = require('../../src/index')
        const app5 = tcb5.init(config)

        try {
            const result1 = await app5.uploadFile({
                cloudPath: '测试.png',
                fileContent: 'test'
            })
        } catch (err) {
            assert(err.message)
        }
    }, 30000)

    it('mock uploadFile  非SignatureDoesNotMatch 报错', async () => {
        // jest.resetModules()
        // mock错误
        jest.mock('request', () => {
            function mockRequest1(params, callback) {
                process.nextTick(() => {
                    callback(null, { statusCode: 200, body: { data: {} } }, { data: {} })
                })
            }

            function mockRequest2(params, callback) {
                const obj = {
                    Error: {
                        Code: 'Not_SignatureDoesNotMatch',
                        Message: ''
                    }
                }

                const builder = new xml2js.Builder()
                const xml = builder.buildObject(obj)

                callback(null, { body: xml }, xml)
            }

            let mR
            let i = 0

            return jest.fn().mockImplementation((params, callback) => {
                // if(!mR) {
                //   mR = mockRequest(params, callback)
                // }

                if (i === 0) {
                    mockRequest1(params, callback)
                } else {
                    mockRequest2(params, callback)
                }
                i++
                // return mR.next()
            })
        })

        const tcb6 = require('../../src/index')
        const app6 = tcb6.init(config)

        try {
            const result1 = await app6.uploadFile({
                cloudPath: '测试.png',
                fileContent: 'test'
            })
        } catch (err) {
            assert(err.code === ERROR.STORAGE_REQUEST_FAIL.code)
        }
    }, 30000)

    it('获取COS直传信息', async () => {
        const app = tcb.init(config)

        let result = await app.getUploadMetadata({
            // cloudPath: "test-admin.jpeg",
            cloudPath: 'test.png'
        })
        assert(result.data.url)
        assert(result.data.token)
        assert(result.data.authorization)
    }, 30000)

    it('上传文件', async () => {
        const app = tcb.init(config)

        const result1 = await app.uploadFile({
            cloudPath: '测试.png',
            fileContent: fs.createReadStream(path.resolve(__dirname, './my-photo.png'))
        })
        assert(result1.fileID)

        const result2 = await app.getTempFileURL({
            fileList: [result1.fileID]
        })
        assert(result2.fileList)
        assert(result2.fileList[0].fileID)
    }, 30000)
})
