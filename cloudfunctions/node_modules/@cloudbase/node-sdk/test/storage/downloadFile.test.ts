import tcb from '../../src/index'
import assert from 'assert'
import config from '../config.local'
import fs from 'fs'
import { ERROR } from '../../lib/const/code'
import { ICustomErrRes } from '../../types/type'
import path from 'path'
let fileContent = fs.createReadStream(`${__dirname}/cos.jpeg`)

describe('storage.downloadFile: 下载文件', () => {
    const app = tcb.init(config)

    it('无效连接下载', async () => {
        try {
            const result = await app.downloadFile({
                fileID: 'unexistFileID'
                // tempFilePath: '/Users/jimmyzhang/repo/tcb-admin-node/test/storage/my-photo.png'
            })
        } catch (e) {
            assert((<ICustomErrRes>e).code === ERROR.STORAGE_FILE_NONEXIST.code)
        }
    }, 30000)

    it('获取文件链接', async () => {
        // 上传文件
        const result1 = await app.uploadFile({
            // cloudPath: "test-admin.jpeg",
            cloudPath: 'a|b测试.jpeg',
            fileContent
        })
        expect(result1.fileID).not.toBeNull()
        const fileID = result1.fileID

        // 下载文件
        const result2 = await app.downloadFile({
            fileID,
            tempFilePath: path.join(__dirname, 'my-photo.png')
        })
        assert(result2.message, '文件下载完成')

        // 下载文件 不知道tempFilePath
        const result3 = await app.downloadFile({
            fileID
        })
        assert.ok(result3.fileContent !== undefined)
    }, 30000)

    it('mock downloadFile statusCode !== 200', async () => {})
})
