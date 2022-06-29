import * as assert from 'power-assert'
import * as Mock from './mock'
import tcb from '../../../src/index'
import * as config from '../../config.local'
import * as common from '../../common/index'

describe('GEO高级功能', () => {
    const app = tcb.init(config)
    const db = app.database()
    const { Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon } = db.Geo

    const collName = 'db-test-geo-advanced'
    const collection = db.collection(collName)
    function randomPoint() {
        return new Point(180 - 360 * Math.random(), 90 - 180 * Math.random())
    }

    const geoNearPoint = new Point(0, 0)
    const line = new LineString([randomPoint(), randomPoint()])

    // “回”字的外环
    const point1 = new Point(-2, -2)
    const point2 = new Point(2, -2)
    const point3 = new Point(2, 2)
    const point4 = new Point(-2, 2)
    // “回”字的内环
    const point5 = new Point(-1, -1)
    const point6 = new Point(1, -1)
    const point7 = new Point(1, 1)
    const point8 = new Point(-1, 1)
    const polygon = new Polygon([
        new LineString([point1, point2, point3, point4, point1]),
        new LineString([point5, point6, point7, point8, point5])
    ])

    const multiPoint = new MultiPoint([randomPoint(), randomPoint(), randomPoint(), randomPoint()])
    const multiLineString = new MultiLineString([
        new LineString([randomPoint(), randomPoint()]),
        new LineString([randomPoint(), randomPoint()]),
        new LineString([randomPoint(), randomPoint()]),
        new LineString([randomPoint(), randomPoint()])
    ])
    const multiPolygon = new MultiPolygon([
        new Polygon([new LineString([point1, point2, point3, point4, point1])]),
        new Polygon([new LineString([point5, point6, point7, point8, point5])])
    ])

    const initialData = {
        point: randomPoint(),
        geoNearPoint,
        line,
        polygon,
        multiPoint,
        multiLineString,
        multiPolygon
    }

    beforeEach(async () => {
        await common.safeCollection(db, collName)
        await db
            .collection(collName)
            .where({
                _id: /.*/
            })
            .remove()
    })

    afterAll(async () => {
        await db
            .collection(collName)
            .where({
                _id: /.*/
            })
            .remove()
    })

    // it.skip('Document - createCollection()', async () => {
    //     await common.safeCollection(db, collName)
    // })

    it('GEO Advanced - CRUD', async () => {
        // Create
        const res = await collection.add(initialData)
        // const id = res.ids[0]
        const id = res.id
        assert(id)
        assert(res.requestId)

        // // Read
        const readRes = await collection
            .where({
                _id: id
            })
            .get()
        assert(readRes.data.length > 0)
        const data = readRes.data[0]

        assert(data.point instanceof Point)
        assert(data.line instanceof LineString)
        assert(data.polygon instanceof Polygon)
        assert(data.multiPoint instanceof MultiPoint)
        assert(data.multiLineString instanceof MultiLineString)
        assert(data.multiPolygon instanceof MultiPolygon)
        assert.deepStrictEqual(data.point, initialData.point)
        assert.deepStrictEqual(data.line, line)
        assert.deepStrictEqual(data.polygon, polygon)
        assert.deepStrictEqual(data.multiPoint, multiPoint)
        assert.deepStrictEqual(data.multiLineString, multiLineString)
        assert.deepStrictEqual(data.multiPolygon, multiPolygon)

        // Update
        let result = await collection.doc(id).set(initialData)
        assert.strictEqual(result.updated, 1)

        assert(result.requestId)

        // Delete
        const deleteRes = await collection
            .where({
                _id: id
            })
            .remove()
        assert.strictEqual(deleteRes.deleted, 1)
    })

    it('GEO - bad create', () => {
        // bad Point
        assert.throws(() => new Point())
        assert.throws(() => new Point([], {}))

        // bad LineString
        assert.throws(() => new LineString({}))
        assert.throws(() => new LineString([]))
        assert.throws(() => new LineString([123, []]))

        // bad Polygon
        assert.throws(() => new Polygon(null))
        assert.throws(() => new Polygon([]))
        assert.throws(() => new Polygon([666, 789]))
        assert.throws(() => new Polygon([new LineString([point1, point2, point3, point4, point8])]))

        // bad MultiPoint
        assert.throws(() => new MultiPoint({}))
        assert.throws(() => new MultiPoint([]))
        assert.throws(() => new MultiPoint([{}, {}]))

        // bad MultiLineString
        assert.throws(() => new MultiLineString({}))
        assert.throws(() => new MultiLineString([]))
        assert.throws(() => new MultiLineString([123, null]))

        // bad MultiPolygon
        assert.throws(() => new MultiPolygon(123))
        assert.throws(() => new MultiPolygon([]))
        assert.throws(() => new MultiPolygon([666, 666]))
    })

    it('GEO - geoNear', async () => {
        // Create
        const geoPoint = new Point(22, 33)
        const res = await collection.add({
            ...initialData,
            point: geoPoint
        })
        // const id = res.ids[0]
        const id = res.id
        assert(id)
        assert(res.requestId)

        // Read
        const readRes = await collection
            .where({
                point: db.command.geoNear({
                    geometry: geoPoint,
                    maxDistance: 1,
                    minDistance: 0
                })
            })
            .get()
        assert(readRes.data.length > 0)
        assert.deepStrictEqual(readRes.data[0].point, geoPoint)

        // 验证geoNear 不填maxDistance minDistance
        const readRes1 = await collection
            .where({
                point: db.command.geoNear({
                    geometry: geoPoint
                })
            })
            .get()

        assert(readRes1.data.length > 0)

        assert.deepStrictEqual(readRes1.data[0].point, geoPoint)

        // Delete
        // const deleteRes = await collection
        //     .where({
        //         _id: id
        //     })
        //     .remove()
        // console.log(deleteRes)
        // assert.strictEqual(deleteRes.deleted, 1)
    })

    it('GEO - geoWithin geometry', async () => {
        const res = await collection.add({
            ...initialData,
            point: new Point(0, 0)
        })
        // const id = res.ids[0]
        const id = res.id
        assert(id)
        assert(res.requestId)

        // Read
        const readRes = await collection
            .where({
                point: db.command.geoWithin({
                    geometry: new Polygon([
                        new LineString([point1, point2, point3, point4, point1])
                    ])
                })
            })
            .get()
        assert(readRes.data.length > 0)
        assert.deepStrictEqual(readRes.data[0].point, new Point(0, 0))

        // Delete
        const deleteRes = await collection
            .where({
                point: db.command.geoWithin({
                    geometry: new Polygon([
                        new LineString([point1, point2, point3, point4, point1])
                    ])
                })
            })
            .remove()
        assert(deleteRes.deleted >= 1)
    })

    it('GEO - geoWithin centerSphere', async () => {
        const res = await collection.add({
            ...initialData,
            point: new Point(-88, 30.001)
        })
        const id = res.id
        assert(id)
        assert(res.requestId)

        // Read
        const readRes = await collection
            .where({
                point: db.command.geoWithin({
                    centerSphere: [new Point(-88, 30), 10 / 6378.1]
                })
            })
            .get()
        assert(readRes.data.length > 0)
        assert.deepStrictEqual(readRes.data[0].point, new Point(-88, 30.001))

        // 校验第一个参数传二维数组
        const readRes1 = await collection
            .where({
                point: db.command.geoWithin({
                    centerSphere: [[-88, 30], 10 / 6378.1]
                })
            })
            .get()
        assert(readRes1.data.length > 0)
        assert.deepStrictEqual(readRes1.data[0].point, new Point(-88, 30.001))

        // 校验第一个参数传 不符合地理位置规范 二维数组
        try {
            await collection
                .where({
                    point: db.command.geoWithin({
                        centerSphere: [[-288, 30], 10 / 6378.1]
                    })
                })
                .get()
        } catch (e) {
            assert(e !== undefined)
        }

        // 校验第二个参数不传数字
        try {
            await collection
                .where({
                    point: db.command.geoWithin({
                        centerSphere: [new Point(-88, 30), '10']
                    })
                })
                .get()
        } catch (e) {
            assert(e !== undefined)
        }
    })
})
