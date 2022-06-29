import * as assert from 'power-assert'
import tcb from '../../src/index'
import * as config from '../config.local'
import * as common from '../common/index'
import { ERROR } from '../../lib/const/code'

describe('test/index.test.ts', () => {
    const app = tcb.init({
        ...config,
        // env: Mock.env,
        // mpAppId: Mock.appId,
        sessionToken: undefined
    })

    let db = null

    try {
        db = app.database('env')
    } catch (err) {
        assert(err.code === ERROR.INVALID_PARAM.code)
    }

    db = app.database()

    const _ = db.command

    const collName = 'db-test-index'
    const collection = db.collection(collName)

    const initialData = {
        name: 'aaa',
        array: [1, 2, 3, [4, 5, 6], { a: 1, b: { c: 'fjasklfljkas', d: false } }],
        data: {
            a: 'a',
            b: 'b',
            c: 'c'
        },
        null: null,
        date: new Date(),
        // regex: new db.RegExp({
        //     regexp: '.*',
        //     options: 'i'
        // }),
        deepObject: {
            'l-02-01': {
                'l-03-01': {
                    'l-04-01': {
                        level: 1,
                        name: 'l-01',
                        flag: '0'
                    }
                }
            }
        }
    }

    beforeAll(async () => {
        await common.safeCollection(db, collName)
    })

    afterAll(async () => {
        await db
            .collection(collName)
            .where({
                _id: /.*/
            })
            .remove()
    })

    it('插入字段null', async () => {
        const addRes = await collection.add({ name: null })
        assert(addRes.id !== undefined)
        const queryRes = await collection.where({ _id: addRes.id }).get()
        assert(queryRes.data)
    })

    it('更新字段为空数组', async () => {
        const addRes = await collection.add({ a: 1 })
        const updateRes = await collection.where({ _id: addRes.id }).update({ a: [] })
        const queryRes = await collection.where({ _id: addRes.id }).get()
        assert(Array.isArray(queryRes.data[0].a))
        await collection.where({ _id: addRes.id }).remove()
    })

    it('验证插入24位可转objid 的id', async () => {
        // 删除{a: 'test'}的数据
        const deleteRes = await collection.where({ a: 'test' }).remove()
        const addRes = await collection.add({ a: 'test', _id: '5e7b474a5e54c773b58d7b39' })
        const queryRes = await collection.where({ _id: '5e7b474a5e54c773b58d7b39' }).get()
        assert(queryRes.data.length === 1)
    })

    it('验证throwOnCode', async () => {
        const app1 = tcb.init({
            ...config,
            throwOnCode: false
        })

        const db = app1.database()

        const _ = db.command

        const collName = 'db-test-index'
        const collection = db.collection(collName)

        const res = await collection.add({ $_key: 1 })
        assert(res.code === 'DATABASE_REQUEST_FAILED')
    })

    it('mock 插入多条', async () => {
        // 构建4W条数据
        let mockData = [],
            i = 0
        while (i++ < 10) {
            mockData.push({ string: 'a', int: -1 })
        }

        const addRes = await collection.add(mockData)
        assert(addRes.ids.length === 10)
    })

    it('清楚mock数据', async () => {
        const deleteRes = await collection.where({ int: -1 }).remove()
        assert(deleteRes.deleted === 10)
    })

    it('验证 无 query count', async () => {
        const countRes = await collection.count()
        assert(countRes.total >= 0)
    })

    it('验证 无 query update', async () => {
        try {
            await collection.update({ a: 1 })
        } catch (e) {
            assert(e.code === 'INVALID_PARAM')
        }
    })

    it('document query custom timeout', async () => {
        const res = await collection
            .where({})
            .options({ timeout: 3000 })
            .limit(1)
            .get()
        assert(res.data)
    })

    it('Document - CRUD', async () => {
        // Create
        const initialData = {
            // $key: '1',
            'key.': '1'
        }
        const res = await collection.add(initialData)

        // assert(res.ids.length > 0)
        assert(res.id)
        assert(res.requestId)

        // Read
        const id = res.id

        let result = await collection
            .where({
                _id: id
            })
            .update({
                data: { a: null, b: null, c: null }
            })
        assert(result.updated > 0)

        result = await collection.where({ _id: id }).get()
        assert(result.data[0])
        assert.deepStrictEqual(result.data[0].data, { a: null, b: null, c: null })

        // Delete
        const deleteRes = await collection.doc(id).remove()
        assert.strictEqual(deleteRes.deleted, 1)
    })

    it('Document - query', async () => {
        assert((await collection.add({ a: 1, b: 100 })).id)
        assert((await collection.add({ a: 10, b: 1 })).id)
        const query = _.or({ b: _.and(_.gte(1), _.lte(10)) }, { b: _.and(_.gt(99), _.lte(101)) })
        const result = await collection.where(query).get()
        assert(result.data.length >= 2)

        // Delete
        const deleteRes = await collection.where(query).remove()
        assert(deleteRes.deleted, 2)
    })

    it('复合and', async () => {
        const result = await collection
            .where({
                date: _.gt(20190401).and(_.lte(20190430)),
                hour: _.gt(8).and(_.lte(12))
            })
            .get()

        assert(!result.code)
    })

    it('验证自定义超时', async () => {
        try {
            const result = await collection
                .where({
                    date: _.gt(20190401).and(_.lte(20190430)),
                    hour: _.gt(8).and(_.lte(12))
                })
                .options({ timeout: 10 })
                .get()
        } catch (err) {
            assert(err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT')
        }
    })

    // option更新单个 or 多个
    it('Document - doc().option().update()', async () => {
        const addRes = await collection.add([{ testNum: 1 }, { testNum: 1 }, { testNum: 1 }])
        assert(addRes.ids.length === 3)
        const updateSingleRes = await collection
            .where({ testNum: 1 })
            .options({ multiple: false })
            .update({ testNum: _.inc(1) })
        assert(updateSingleRes.updated === 1)

        const updateMultiRes = await collection
            .where({ testNum: _.gt(0) })
            .options({ multiple: true })
            .update({ testNum: _.inc(1) })
        assert(updateMultiRes.updated === 3)

        // 不传multiple字段
        const updateMultiRes1 = await collection
            .where({ testNum: _.gt(0) })
            .options({})
            .update({ testNum: _.inc(1) })
        assert(updateMultiRes1.updated === 3)

        // 不设options
        const updateMultiRes2 = await collection
            .where({ testNum: _.gt(0) })
            .options({})
            .update({ testNum: _.inc(1) })
        assert(updateMultiRes2.updated === 3)
    })

    // options 删除单个 or 多个
    it('Document - doc().option().delete()', async () => {
        const deleteSingleRes = await collection
            .where({ testNum: _.gt(0) })
            .options({ multiple: false })
            .remove()

        assert(deleteSingleRes.deleted === 1)

        const deleteMultiRes = await collection
            .where({ testNum: _.gt(0) })
            // .options({ multiple: true })
            .options({})
            .remove()
        assert(deleteMultiRes.deleted === 2)
    })

    it('验证findAndModify', async () => {
        const addRes = await collection.add([{ a: 1 }, { a: 1 }])
        const res = await collection.where({ a: 1 }).updateAndReturn({
            a: 2
        })

        assert(res.doc.a === 2)
    })

    it('验证findAndModify 更新相同值', async () => {
        const addRes = await collection.add([{ a: 1 }])
        const res = await collection.where({ a: 1 }).updateAndReturn({
            a: 1
        })
        assert(res.updated === 1)
    })

    it('验证findAndModify 更新失败', async () => {
        const res = await collection.where({ a: -1 }).updateAndReturn({ a: 1 })
        assert(res.updated === 0 && res.doc === null)
    })

    // it.only('insert null', async () => {
    //     const addRes = await collection.add(null)
    //     console.log('addRes:', addRes)
    // })
})
