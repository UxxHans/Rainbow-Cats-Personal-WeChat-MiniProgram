import * as assert from 'power-assert'
import tcb from '../../../src/index'
import { ErrorCode } from '@cloudbase/database/src/constant'
import * as Config from '../../config.local'
import * as common from '../../common'
import { create } from 'domain'

describe('test/unit/collection.test.ts', () => {
    const collName = 'db-test-collection'

    const app = tcb.init(Config)
    const db = app.database()
    const collection = db.collection(collName)
    const data = [{ name: 'A' }, { name: 'B' }]
    let createColl = null

    it('name test', async () => {
        assert(collection.name === collName)
        createColl = await common.safeCollection(db, collName)
        createColl.create(data)
    })

    it('Error - use invalid docId to get reference', () => {
        const docId = 'abcdefg'
        try {
            collection.doc(docId)
        } catch (e) {
            assert(e.message === ErrorCode.DocIDError)
        }
    })

    it('API - get all data', async () => {
        const res = await collection.get()
        assert(Array.isArray(res.data))
    })

    // it('API - use where', async () => {
    //   const field = 'name'
    //   const value = 'huming'
    //   const opStr = '=='
    //   const data = await collection.where(field, opStr, value).get()
    //   assert(Array.isArray(data.data))
    // })

    it('API - use orderBy', async () => {
        const field = 'name'
        const direction = 'asc'
        const data = await collection.orderBy(field, direction).get()
        assert(Array.isArray(data.data))
    })

    it('API - use limit', async () => {
        const limit = 1
        const data = await collection.limit(limit).get()
        assert(Array.isArray(data.data) && data.data.length === limit)
    })

    it('API - use offset', async () => {
        const offset = 2
        const data = await collection.skip(offset).get()
        assert(Array.isArray(data.data))
    })

    it('API - add one doc, update and remove', async () => {
        // 清除collection
        await createColl.remove()

        const res = await collection.add({
            name: 'huming'
        })
        assert(res.id)

        const data = await collection
            .where({
                name: db.command.eq('huming')
            })
            .update({
                age: 18
            })
        assert(data.updated > 0)

        const remove = await collection
            .where({
                name: db.command.eq('huming')
            })
            .remove()

        assert(remove.deleted > 0)
    })

    it('API - use field', async () => {
        // await db.createCollection(collName)
        await common.safeCollection(db, collName)
        const res = await collection.field({ age: 1 }).get()
        assert(Array.isArray(res.data))
    })

    it('API - add and remove with skip', async () => {
        const text = 'test for add and remove with skip'
        let i = 0
        while (i++ < 10) {
            await collection.add({
                text
            })
        }

        let result = await collection
            .where({
                text
            })
            .get()

        assert(result.data.length > 0)

        await collection
            .where({
                text
            })
            .orderBy('text', 'asc')
            .skip(3)
            .remove()

        result = await collection
            .where({
                text
            })
            .get()

        assert(result.data.length === 0)
    })

    it('API - use where', async () => {
        // 1. 验证where 必填object 对象参数
        try {
            await collection.where().get()
        } catch (e) {
            assert(e.message === ErrorCode.QueryParamTypeError)
        }

        // 2. 验证where 对象value不可均为undefined
        try {
            await collection.where({ a: undefined }).get()
        } catch (e) {
            assert(e.message === ErrorCode.QueryParamValueError)
        }

        await collection.add([
            {
                name: 'aaa'
            }
        ])

        const res1 = await collection.where({ name: 'aaa' }).get()
        assert(res1.data.length > 0)

        const res2 = await collection.where({}).get()
        assert(res2.data.length > 0)

        // 清楚当前collection
        await createColl.remove()
    })

    it('API - mongodb raw query', async () => {
        await collection.add([
            {
                key: "a",
                value: 60
            }
        ])

        // mongodb 原生查询
        const res1 = await collection
            .options({ raw: true })
            .where({ key: { $eq: "a" } })
            .get()
        assert(res1.data.length > 0)

        const res2 = await collection
            .options({ raw: true })
            .where({ key: "a" })
            .get()
        assert(res1.data.length === res2.data.length)
    })
})
