import tcb from '../../src/index'
import fs from 'fs'
import assert from 'assert'
import config from '../config.local'

describe('storage.getFileAuthority: ', () => {
    const app = tcb.init(config)
    let fileID = ''

    let fileContent = fs.createReadStream(`${__dirname}/cos.jpeg`)
    it('filelist not a array', async () => {
        expect(
            app.getFileAuthority({
                fileList: {
                    path: '',
                    type: 'READ'
                }
            })
        ).rejects.toThrow(new Error('[node-sdk] getCosFileAuthority fileList must be a array'))
    })

    it('filelist param error', async () => {
        // file undefined
        expect(
            app.getFileAuthority({
                fileList: [undefined]
            })
        ).rejects.toThrow(new Error('[node-sdk] getCosFileAuthority fileList param error'))

        // file doesn't have path
        expect(
            app.getFileAuthority({
                fileList: [{ key: 'invalidKey' }]
            })
        ).rejects.toThrow(new Error('[node-sdk] getCosFileAuthority fileList param error'))

        // file type invalid
        expect(
            app.getFileAuthority({
                fileList: [{ type: 'invalidType', path: 'invalidPath' }]
            })
        ).rejects.toThrow(new Error('[node-sdk] getCosFileAuthority fileList param error'))

        // userinfo invalid
        expect(
            app.getFileAuthority({
                fileList: [
                    {
                        path: 'testPath',
                        type: 'READ'
                    }
                ]
            })
        ).rejects.toThrow(new Error('[node-sdk] admin do not need getCosFileAuthority.'))
    })

    it('获取文件权限', async () => {
        process.env.LOGINTYPE = 'QQ-MINI'
        process.env.TCB_CONTEXT_KEYS = 'TCB_UUID'
        process.env.TCB_UUID = 'TCB_UUID'

        // 上传
        const result1 = await app.uploadFile({
            // cloudPath: "test-admin.jpeg",
            cloudPath: 'a|b测试.jpeg',
            fileContent
        })
        expect(result1.fileID).not.toBeNull()
        fileID = result1.fileID

        // 获取权限
        const authorityRes = await app.getFileAuthority({
            fileList: [
                {
                    path: result1.fileID,
                    type: 'READ'
                }
            ]
        })
        assert.ok(authorityRes.data[0].cosFileId !== undefined)

        process.env.LOGINTYPE = ''
        process.env.TCB_CONTEXT_KEYS = ''
        process.env.TCB_UUID = ''
    }, 30000)

    it('mock getFileAuthority code', async () => {
        jest.resetModules()
        // 上传
        // const result1 = await app.uploadFile({
        //     cloudPath: 'a|b测试.jpeg',
        //     fileContent
        // })
        // expect(result1.fileID).not.toBeNull()

        jest.mock('request', () => {
            return jest.fn().mockImplementation((params, callback) => {
                const body = {
                    code: 'mockCode',
                    message: 'mockMessage'
                }
                process.nextTick(() => {
                    callback(null, { statusCode: 200, body })
                })
            })
        })

        process.env.LOGINTYPE = 'QQ-MINI'
        process.env.TCB_CONTEXT_KEYS = 'TCB_UUID'
        process.env.TCB_UUID = 'TCB_UUID'

        const tcb1 = require('../../src/index')
        const app1 = tcb1.init(config)

        // 获取权限
        expect(
            app1.getFileAuthority({
                fileList: [
                    {
                        path: fileID,
                        type: 'READ'
                    }
                ]
            })
        ).rejects.toThrow(new Error(`mockMessage`))

        const app2 = tcb1.init({
            ...config,
            throwOnCode: false
        })
        expect(
            app2.getFileAuthority({
                fileList: [
                    {
                        path: fileID,
                        type: 'READ'
                    }
                ]
            })
        ).rejects.toThrow(new Error('[node-sdk] getCosFileAuthority failed: mockCode'))
        // assert.ok(res.code === '')

        process.env.LOGINTYPE = ''
        process.env.TCB_CONTEXT_KEYS = ''
        process.env.TCB_UUID = ''
    }, 30000)
})
