import * as assert from 'power-assert'
import * as Mock from './mock'
import tcb from '../../../src/index'
import * as Config from '../../config.local'
import * as common from '../../common/index'
import * as util from 'util'
// import { process } from "ts-jest/dist/preprocessor";
// import { __exportStar } from "tslib";

describe('Date类型', () => {
    const config = {
        ...Config,
        env: Mock.env,
        mpAppId: Mock.appId,
        sessionToken: undefined
    }

    const app = tcb.init(config)
    const db = app.database()

    const collName = 'db-test-date'
    const _ = db.command

    const collection = db.collection(collName)
    // const nameList = ["f", "b", "e", "d", "a", "c"];

    const date = new Date()
    const offset = 60 * 1000
    // const timestamp = Math.floor(+new Date() / 1000)
    const initialData = {
        name: 'test',
        date,
        serverDate1: new db.serverDate(),
        serverDate2: db.serverDate({ offset }),
        innerServerDate: [db.serverDate({ offset })],
        emptyArray: [],
        emptyObject: {},
        // timestamp: {
        //     $timestamp: timestamp
        // }
        foo: {
            bar: db.serverDate({ offset })
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

    it('验证 long 值offset', async () => {
        const offset = 31536000000 // 1年的毫秒数
        const currYear = new Date().getFullYear()
        const res = await collection.add({
            name: 'longOffsetTest',
            serverDate1: db.serverDate({ offset })
        })

        const queryRes = await collection.where({ _id: res.id }).get()
        const newYear = queryRes.data[0].serverDate1.getFullYear()
        // console.log(queryRes.data[0].serverDate1)
        // console.log('res:', res)
        assert(newYear - currYear === 1)
    })

    it('Document - CRUD', async () => {
        // Create
        const res = await collection.add(initialData)
        // const id = res.ids[0]
        const id = res.id
        assert(id)
        assert(res.requestId)

        // // Read
        // const { id } = res
        let result = await collection
            .where({
                _id: id
            })
            .get()
        assert.strictEqual(result.data[0].date.getTime(), date.getTime())
        assert(util.isDate(result.data[0].foo.bar))
        assert.strictEqual(assert.strictEqual(result.data[0].serverDate1.getDate(), date.getDate()))
        assert.strictEqual(
            result.data[0].serverDate1.getTime() + offset,
            result.data[0].serverDate2.getTime()
        )
        // assert.strictEqual(result.data[0].timestamp.getTime(), timestamp * 1000)
        assert.deepStrictEqual(result.data[0].emptyArray, [])
        assert.deepStrictEqual(result.data[0].emptyObject, {})

        result = await collection
            .where({
                date: db.command.eq(date)
            })
            .get()
        assert.strictEqual(result.data[0].date.getTime(), date.getTime())

        result = await collection
            .where({
                date: db.command.lte(date)
            })
            .get()
        assert(result.data.length > 0)

        result = await collection
            .where({
                date: db.command.lte(date).and(db.command.gte(date))
            })
            .get()
        assert(result.data.length > 0)

        // Update
        const newDate = new Date()
        const newServerDate = new db.serverDate({ offset: 1000 * 60 * 60 }) // offset一小时
        result = await collection
            .where({
                date: db.command.lte(date).and(db.command.gte(date))
            })
            .update({
                date: newDate,
                serverDate2: newServerDate,
                innerServerDate: _.push(db.serverDate({ offset }))
            })
        assert.strictEqual(result.updated, 1)
        result = await collection
            .where({
                _id: id
            })
            .get()
        assert.strictEqual(result.data[0].date.getTime(), newDate.getTime())
        assert(
            result.data[0].serverDate2.getTime() - result.data[0].serverDate1.getTime() >
                1000 * 60 * 60
        )

        // Delete
        const deleteRes = await collection.doc(id).remove()
        // const deleteRes = await collection.where({ name: 'test' }).remove()
        assert.strictEqual(deleteRes.deleted, 1)
    })
})
