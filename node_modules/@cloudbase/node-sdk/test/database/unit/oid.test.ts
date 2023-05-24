import * as assert from 'power-assert'
import * as Mock from '../unit/mock'
import tcb from '../../../src/index'
import * as Config from '../../config.local'
import * as common from '../../common/index'
import { ObjectID } from 'bson'

describe('objectid特殊结构', () => {
    const app = tcb.init(Config)
    const db = app.database()

    const collName = 'db-test-oid-test'
    const lookupCollName = 'db-test-oid-test-lookup'
    const collection = db.collection(collName)
    const lookupCollection = db.collection(lookupCollName)

    beforeAll(async () => {
        await common.safeCollection(db, collName)
        await common.safeCollection(db, lookupCollName)
    })

    afterAll(async () => {
        await db
            .collection(collName)
            .where({
                _id: /.*/
            })
            .remove()
        await db.collection(lookupCollName)
            .where({
                _id: /.*/
            })
            .remove()
        // console.log('test')
        // const getRes = await db.collection(collName).where({}).get()
        // console.log('getRes', getRes)
    })

    it('test _id 为oid 结构插入', async () => {
        const objId = new ObjectID().toString()
        console.log('objId', objId)
        const addRes = await collection.add({
            _id: db.ObjectId({ id: objId })
        })
        console.log('addRes:', addRes)
        assert(addRes.id === objId)
    })

    it('test 非 _id 为oid 结构插入', async () => {
        const objId = new ObjectID().toString()

        const insertRes = await collection.add({
            a: db.ObjectId({ id: objId })
        })

        assert(insertRes.id !== undefined)

        const getRes = await collection.where({
            a: db.ObjectId({ id: objId })
        }).get()

        assert(getRes.data[0].a === objId)
    })

    it('test 联表 _id 与 非_id字段', async () => {
        const objId1 = new ObjectID().toString()
        const objId2 = new ObjectID().toString()

        const addRes = await collection.add({
            "_id": db.ObjectId({ id: objId1 }),
            "inviter_uid": db.ObjectId({ id: objId2 }),
            "name": 'test'
        })
        assert(addRes.id === objId1)

        const addRes1 = await lookupCollection.add({
            "_id": db.ObjectId({ id: objId2 }),
            "inviter_uid": db.ObjectId({ id: objId1 }),
            "name": 'test1'
        })
        assert(addRes1.id === objId2)


        const aggregateRes = await lookupCollection.aggregate().lookup({
            from: collName,
            localField: 'inviter_uid',
            foreignField: '_id',
            as: 'newTest'
        }).end()
        assert(aggregateRes.data.length > 0)
    })
})
