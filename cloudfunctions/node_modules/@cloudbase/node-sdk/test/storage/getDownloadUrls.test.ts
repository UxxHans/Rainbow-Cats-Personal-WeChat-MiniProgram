import tcb from '../../src/index'
import config from '../config.local'
import fs from 'fs'
import { ERROR } from '../../lib/const/code'
import assert from 'assert'
import { ICustomErrRes } from '../../lib/type'

let fileContent = fs.createReadStream(`${__dirname}/cos.jpeg`)

describe('storage.batchGetDownloadUrl: 获取文件下载链接', () => {
    const app = tcb.init(config)

    it('校验获取下载链接传参', async () => {
        // fileList 必须存在且为数组类型
        try {
            await app.getTempFileURL({
                fileList: null
            })
        } catch (e) {
            assert(e.code === ERROR.INVALID_PARAM.code && e.message === 'fileList必须是非空的数组')
        }

        try {
            await app.getTempFileURL({
                fileList: {}
            })
        } catch (e) {
            assert(e.code === ERROR.INVALID_PARAM.code && e.message === 'fileList必须是非空的数组')
        }

        // fileList中的file必须为Object ({fileid, max_age}) 或者 字符串
        try {
            await app.getTempFileURL({
                fileList: [{ fileID: 'testFileID' }]
            })
        } catch (e) {
            assert(
                e.code === ERROR.INVALID_PARAM.code &&
                e.message === 'fileList的元素如果是对象，必须是包含fileID和maxAge的对象'
            )
        }

        try {
            await app.getTempFileURL({
                fileList: [{ maxAge: 10 }]
            })
        } catch (e) {
            assert(
                e.code === ERROR.INVALID_PARAM.code &&
                e.message === 'fileList的元素如果是对象，必须是包含fileID和maxAge的对象'
            )
        }

        try {
            await app.getTempFileURL({
                fileList: [123]
            })
        } catch (e) {
            assert(
                e.code === ERROR.INVALID_PARAM.code &&
                e.message === 'fileList的元素如果不是对象，则必须是字符串'
            )
        }
    }, 30000)

    it('获取超出文件数限制50的下载链接', async () => {
        let i = 0
        let fileList = []
        while (i++ <= 50) {
            fileList.push('testFileId')
        }
        try {
            const result = await app.getTempFileURL({
                fileList
            })
        } catch (e) {
            // console.log(e)
            assert((<ICustomErrRes>e).code === ERROR.INVALID_PARAM.code)
        }
    }, 30000)

    it('单环境下上传文件、获取文件链接', async () => {
        const result1 = await app.uploadFile({
            // cloudPath: "test-admin.jpeg",
            cloudPath: 'a|b测试.jpeg',
            fileContent
        })
        expect(result1.fileID).not.toBeNull()
        const fileID = result1.fileID
        const result2 = await app.getTempFileURL({
            fileList: [fileID]
        })
        expect(result2.fileList[0].code).toBe('SUCCESS')
    }, 30000)

    // it("获取多环境下文件链接", async () => {
    //   // 本地测试时配置qbase-service 下checkCamAuth文件 qcAppId: 1257145308,uin: 100006570100
    //   // tcb-admin-node 下config.js文件 env: "luke-001" (或luke-004, luke-005)
    //   const fileIDList = [
    //     "cloud://luke-001.6c75-luke-001-1251178460/a|b.jpeg",
    //     "cloud://luke-004.6c75-luke-004-1251178460/a|b.jpeg",
    //     "cloud://luke-005.6c75-luke-005-1251178460/a|b.jpeg",
    //     "cloud://luke-005.6c75-luke-005-1251178460/a|b.jpeg"
    //   ];
    //   result = await tcb.getTempFileURL({
    //     fileList: fileIDList
    //   });
    //   console.log("result:", JSON.stringify(result));
    //   for (let file of result.fileList) {
    //     expect(file.code).toBe("SUCCESS");
    //   }
    // }, 30000);

    // it("fileID的环境ID和当前环境ID不一致", async () => {
    //   result = await tcb.getTempFileURL({
    //     fileList: ["cloud://xxxx0000.tcbenv-mPIgjhnq/1535367916760.jpg"]
    //   });
    //   expect(result.fileList[0].code).toBe("INVALIID_ENV");
    // });

    it('文件不存在', async () => {
        const result = await app.getTempFileURL({
            fileList: [`cloud://${config.env}.tcbenv-mPIgjhnq/1535367916760.jpg`]
        })
        expect(result.fileList[0].code).toBe('STORAGE_FILE_NONEXIST')
    })

    it('验证 文件存储接口自定义超时', async () => {
        try {
            const result = await app.getTempFileURL(
                {
                    fileList: [`cloud://${config.env}.tcbenv-mPIgjhnq/1535367916760.jpg`]
                },
                {
                    timeout: 10
                }
            )
            assert(!result)
        } catch (err) {
            assert(err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT')
        }
    })

    it('mock getTempFileURL return code', async () => {
        jest.resetModules()
        jest.mock('request', () => {
            return jest.fn().mockImplementation((params, callback) => {
                const body = { code: 'mockCode', message: 'mockMessage' }
                process.nextTick(() => {
                    callback(null, { statusCode: 200, body })
                })
            })
        })

        const tcb1 = require('../../src/index')
        const app1 = tcb1.init(config)

        expect(
            app1.getTempFileURL({
                fileList: ['mockFileID']
            })
        ).rejects.toThrow(new Error('mockMessage'))

        const app2 = tcb1.init({
            ...config,
            throwOnCode: false
        })
        const res = await app2.getTempFileURL({
            fileList: ['mockFileID']
        })
        assert(res.code === 'mockCode')
    })
})
