import * as assert from 'power-assert'
import tcb from '../../../src/index'
import * as config from '../../config.local'
import * as common from '../../common/index'

const app = tcb.init(config)
const db = app.database()
let createCollection = null
beforeAll(async () => {
    // 删除 1001条文档
    const collName = 'db-test-limit'
    const collection = db.collection(collName)
    createCollection = await common.safeCollection(db, collName)

    const delRes = await collection
        .where({
            luke: 'luke-limit-test'
        })
        .remove()
    assert(delRes.deleted >= 0)
    // // 创建 1001条文档
    let addDocs = []
    let i = 0
    while (i++ < 1001) {
        addDocs.push({ luke: 'luke-limit-test' })
    }
    const addRes = await collection.add(addDocs)
    assert(addRes.ids.length === 1001)
})

afterAll(async () => {
    const success = await createCollection.remove()
    assert.strictEqual(success, true)
})

describe('test/unit/query.limit.test.ts', () => {
    // 等于 1000
    it('query with limit 1000', async () => {
        const collName = 'db-test-limit'
        const collection = db.collection(collName)
        const queryRes = await collection
            .where({})
            .limit(1000)
            .get()

        assert(queryRes.data.length === 1000)
    })

    // 大于1000
    it('query with limit > 1000', async () => {
        const collName = 'db-test-limit'
        const collection = db.collection(collName)
        const queryRes = await collection
            .where({})
            .limit(1001)
            .get()

        assert(queryRes.data.length === 1000)
    })

    // 小于1000
    it('query with limit < 1000', async () => {
        const collName = 'db-test-limit'
        const collection = db.collection(collName)
        const queryRes = await collection
            .where({})
            .limit(101)
            .get()

        assert(queryRes.data.length === 101)
    })

    // 不填 默认100
    it('query with limit default 100', async () => {
        const collName = 'db-test-limit'
        const collection = db.collection(collName)
        const queryRes = await collection.where({}).get()

        assert(queryRes.data.length === 100)
    })
})
