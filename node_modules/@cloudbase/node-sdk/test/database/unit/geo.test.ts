import * as assert from 'power-assert'
import * as Mock from '../unit/mock'
import tcb from '../../../src/index'
import * as config from '../../config.local'
import * as common from '../../common/index'

describe('GEO类型', () => {
    const app = tcb.init(config)
    const db = app.database()

    const collName = 'db-test-geo'
    const collection = db.collection(collName)

    const longitude = -180
    const latitude = 20
    const point = new db.Geo.Point(longitude, latitude)
    const initialData = {
        point,
        pointArr: [point, point, point],
        uuid: '416a4700-e0d3-11e8-911a-8888888888',
        string: '新增单个string字段1。新增单个string字段1。',
        due: new Date('2018-09-01'),
        int: 100,
        geo: new db.Geo.Point(90, 23),
        array: [
            {
                string: '99999999',
                due: new Date('2018-09-01'),
                geo: new db.Geo.Point(90, 23)
            },
            {
                string: '0000000',
                geo: new db.Geo.Point(90, 23),
                null: null
            }
        ]
    }
    // const nameList = ["f", "b", "e", "d", "a", "c"];

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

    // it('Document - createCollection()', async () => {
    //     await common.safeCollection(db, collName)
    // })

    it('GEO Point - CRUD', async () => {
        // Create
        let res = await collection.add(initialData)
        // const id = res.ids[0]
        const id = res.id
        assert(id)
        assert(res.requestId)

        const res2 = await collection.doc(id).set(initialData)
        assert.strictEqual(res2.updated, 1)
        assert(res2.requestId)

        // Read
        let result = await collection
            .where({
                _id: id
            })
            .get()
        assert(result.data.length > 0)
        assert.deepEqual(result.data[0].point, { longitude, latitude })

        // TODO: 现在对 GEO 进行 $eq 操作，小概率会查不到，需要修改查询的底层结构
        // result = await collection
        //   .where({
        //     point: db.command.eq(point)
        //   })
        //   .get()
        // console.log(point, result)
        // assert(result.data.length > 0)

        // result = await collection
        //   .where({
        //     point: db.command.or(db.command.eq(point))
        //   })
        //   .get()
        // console.log(point, result)
        // assert(result.data.length > 0)

        // result = await collection
        //   .where({
        //     point: point
        //   })
        //   .get()
        // console.log(result)
        // assert(result.data.length > 0)

        // Delete
        const deleteRes = await collection
            .where({
                _id: id
            })
            .remove()
        console.log(deleteRes)
        assert.strictEqual(deleteRes.deleted, 1)
    })
})
