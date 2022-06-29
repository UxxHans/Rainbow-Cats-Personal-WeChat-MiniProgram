import * as assert from 'power-assert'
import tcb from '../../../src/index'
import * as Config from '../../config.local'
import * as common from '../../common/index'

const app = tcb.init(Config)
const db = app.database()
const _ = db.command
const offset = 60 * 1000

describe('transaction', () => {
    let collection = null
    const collectionName = 'db-test-transactions'

    const date = new Date()
    const data = [
        {
            _id: '1',
            category: 'Web',
            tags: ['JavaScript', 'C#'],
            date,
            geo: new db.Geo.Point(90, 23),
            num: 2
        },
        { _id: '2', category: 'Web', tags: ['Go', 'C#'] },
        { _id: '3', category: 'Life', tags: ['Go', 'Python', 'JavaScript'] },
        { _id: '4', serverDate1: db.serverDate(), serverDate2: db.serverDate({ offset }) }
    ]

    beforeEach(async () => {
        collection = await common.safeCollection(db, collectionName)
        // 测试环境不稳定, 清除之前的影响
        await collection.remove()
        const success = await collection.create(data)
        assert.strictEqual(success, true)
    })

    afterEach(async () => {
        const success = await collection.remove()
        assert.strictEqual(success, true)
    })

    it('发起事务', async () => {
        const transaction = await db.startTransaction()
        assert.strictEqual(typeof transaction._id, 'string')
    })

    it('提交事务', async () => {
        const transaction = await db.startTransaction()
        const res = await transaction.commit()
        assert.strictEqual(typeof res.requestId, 'string')
    })

    it('runTransaction', async () => {
        await db.runTransaction(async function(transaction) {
            // 事务内插入 含date geo类型文档
            const insertDoc = { _id: 'lluke', date: date, geo: new db.Geo.Point(90, 23) }
            const insertRes = await transaction.collection(collectionName).add(insertDoc)
            assert(insertRes.inserted === 1)

            const doc = await transaction
                .collection(collectionName)
                .doc('lluke')
                .get()
            assert(doc.data, insertDoc)

            // 事务外插入含date geo serverDate 类型文档
            const doc1 = await transaction
                .collection(collectionName)
                .doc('1')
                .get()
            const doc4 = await transaction
                .collection(collectionName)
                .doc('4')
                .get()
            assert.deepStrictEqual(doc1.data, data[0])
            assert.deepStrictEqual(
                doc4.data.serverDate1.getTime() + offset === doc4.data.serverDate2.getTime(),
                true
            )

            // 事务内插入 含 serverDate 类型文档 报错不支持
            // const insertRes = await transaction.collection(collectionName).add({_id: 'lluke', serverDate1: db.serverDate(), serverDate2: db.serverDate({ offset })})
            // console.log('insertRes:', insertRes)

            // const lukeData = await transaction.collection(collectionName).doc('lluke').get()
            // assert(lukeData.data.serverDate1.getTime() + offset === lukeData.data.serverDate2.getTime(), true)
        })
    })

    it('事务内批量插入 条件查询', async () => {
        const transaction = await db.startTransaction()
        const addRes = await transaction
            .collection(collectionName)
            .add([{ name: 'a' }, { name: 'b' }])
        assert(addRes.ids.length === 2)

        const queryRes = await transaction
            .collection(collectionName)
            .where(_.or([{ name: 'a' }, { name: 'b' }]))
            .get()
        assert(queryRes.data.length === 2)

        const result = await transaction.commit()
        assert.strictEqual(typeof result.requestId, 'string')
    })

    it('事务内批量插入1000条文档', async () => {
        const transaction = await db.startTransaction()
        // 构造1001条数据
        const mockData = []
        let i = 0
        while (i++ <= 1000) {
            mockData.push({ name: `luketest${i}` })
        }
        const addRes = await transaction.collection(collectionName).add(mockData)

        assert(addRes.ids.length === 1001)

        const queryRes = await transaction
            .collection(collectionName)
            .where({ name: /^luketest/ })
            .limit(1000)
            .get()
        // console.log('queryRes:', queryRes)
        assert(queryRes.data.length === 1000)

        const result = await transaction.commit()
        assert.strictEqual(typeof result.requestId, 'string')
    })

    it('事务内更新含特殊类型 字段文档', async () => {
        await db.runTransaction(async function(transaction) {
            const newDate = new Date()
            const newGeo = new db.Geo.Point(90, 23)
            const updateRes = await transaction
                .collection(collectionName)
                .doc('1')
                .update({
                    num: _.inc(1),
                    date: newDate,
                    geo: newGeo
                })
            assert(updateRes.updated === 1)
            const res = await transaction
                .collection(collectionName)
                .doc('1')
                .get()
            assert(res.data.num === 3, true)
            assert(res.data.date, newDate)
            assert(res.data.geo, newGeo)
        })
    })

    it('insert', async () => {
        const transaction = await db.startTransaction()
        const res = await transaction
            .collection(collectionName)
            .add({ category: 'Web', tags: ['JavaScript', 'C#'], date })
        assert(res.id !== undefined && res.inserted === 1)
        const result = await transaction.commit()
        assert.strictEqual(typeof result.requestId, 'string')
    })

    it('insert with custom docid', async () => {
        const docId = +new Date()
        const transaction = await db.startTransaction()
        const res = await transaction
            .collection(collectionName)
            .add({ _id: docId, category: 'Web', tags: ['JavaScript', 'C#'], date })
        assert(res.id == docId && res.inserted === 1)
        const deleteRes = await transaction
            .collection(collectionName)
            .doc(docId)
            .remove()
        assert(deleteRes.deleted === 1)
        const result = await transaction.commit()
        assert.strictEqual(typeof result.requestId, 'string')
    })

    it('get', async () => {
        // const docRef = db.collection(collectionName).doc('1')
        const transaction = await db.startTransaction()
        // const doc = await transaction.get(docRef)
        const doc = await transaction
            .collection(collectionName)
            .doc('1')
            .get()
        assert.deepStrictEqual(doc.data, data[0])
        const res = await transaction.commit()
        assert(res.requestId)
    })

    it('get不存在的文档，返回null', async () => {
        // const docRef = db.collection(collectionName).doc('114514')
        const transaction = await db.startTransaction()
        // const doc = await transaction.get(docRef)
        const doc = await transaction
            .collection(collectionName)
            .doc('114514')
            .get()
        assert.strictEqual(doc.data, null)
        const res = await transaction.commit()
        assert(res.requestId)
    })

    it('事务回滚', async () => {
        const transaction = await db.startTransaction()
        // const docRef = db.collection(collectionName).doc('1')
        // const doc = await transaction.get(docRef)
        const doc = await transaction
            .collection(collectionName)
            .doc('1')
            .get()

        const addDoc = await transaction
            .collection(collectionName)
            .add({ _id: '5', category: 'hope' })

        assert.deepStrictEqual(addDoc.id, '5')
        assert.deepStrictEqual(doc.data, data[0])
        const res = await transaction.rollback()
        assert(res.requestId)
    })

    it('update', async () => {
        // const docRef = db.collection(collectionName).doc('1')
        const transaction = await db.startTransaction()
        // let doc = await transaction.get(docRef)
        let doc = await transaction
            .collection(collectionName)
            .doc('1')
            .get()
        assert.deepStrictEqual(doc.data, data[0])

        const date = new Date()
        // const updateResult = await transaction.update(docRef, {
        //   category: 'Node.js',
        //   date
        // })
        const updateResult = await transaction
            .collection(collectionName)
            .doc('1')
            .update({
                category: 'Node.js',
                date
            })

        assert.strictEqual(updateResult.updated, 1)

        // doc = await transaction.get(docRef)
        doc = await transaction
            .collection(collectionName)
            .doc('1')
            .get()
        assert.deepStrictEqual(doc.data, {
            ...data[0],
            date,
            category: 'Node.js'
        })

        const res = await transaction.commit()
        assert(res.requestId)
    })

    it('modifyAndReturnDoc', async () => {
        const transaction = await db.startTransaction()
        let modifyAndReturnRes = await transaction
            .collection(collectionName)
            .where({ category: 'Web' })
            .updateAndReturn({
                category: 'web'
            })
        const res = await transaction.commit()
        assert(modifyAndReturnRes.doc.category === 'web')
    })

    it('set doc', async () => {
        // const docRef = db.collection(collectionName).doc('1')
        const transaction = await db.startTransaction()
        // let doc = await transaction.get(docRef)
        let doc = await transaction
            .collection(collectionName)
            .doc('1')
            .get()

        const date = new Date()
        // const updateResult = await transaction.set(docRef, {
        //   ...data[0],
        //   date,
        //   category: 'Node.js'
        // })
        const newData = { ...data[0] }
        delete newData['_id']

        const updateResult = await transaction
            .collection(collectionName)
            .doc('1')
            .set({
                ...newData,
                date,
                category: 'Node.js'
            })

        assert.strictEqual(updateResult.updated, 1)

        // doc = await transaction.get(docRef)
        doc = await transaction
            .collection(collectionName)
            .doc('1')
            .get()
        assert.deepStrictEqual(doc.data, {
            ...data[0],
            date,
            category: 'Node.js'
        })

        const res = await transaction.commit()
        assert(res.requestId)
    })

    it('upsert doc', async () => {
        // const docRef = db.collection(collectionName).doc('114514')
        const transaction = await db.startTransaction()
        // let doc = await transaction.get(docRef)

        let doc = await transaction
            .collection(collectionName)
            .doc('114514')
            .get()
        assert.deepStrictEqual(doc.data, null)

        const date = new Date()
        const data = {
            category: 'Node.js',
            date
        }
        // const updateResult = await transaction.set(docRef, data)
        const updateResult = await transaction
            .collection(collectionName)
            .doc('114514')
            .set(data)

        assert.strictEqual(updateResult.upserted.length, 1)

        // doc = await transaction.get(docRef)
        doc = await transaction
            .collection(collectionName)
            .doc('114514')
            .get()
        assert.deepStrictEqual(doc.data, {
            _id: '114514',
            ...data
        })

        const res = await transaction.rollback()
        assert(res.requestId)
    })

    it('delete doc', async () => {
        // 前面测试用例更改过 _id = 1 的数据
        // const docRef = db.collection(collectionName).doc('2')
        const transaction = await db.startTransaction()
        // let doc = await transaction.get(docRef)
        let doc = await transaction
            .collection(collectionName)
            .doc('2')
            .get()
        assert.deepStrictEqual(doc.data, data[1])

        // const deleteResult = await transaction.delete(docRef)
        const deleteResult = await transaction
            .collection(collectionName)
            .doc('2')
            .delete()
        assert.strictEqual(deleteResult.deleted, 1)

        // doc = await transaction.get(docRef)
        doc = await transaction
            .collection(collectionName)
            .doc('2')
            .get()
        assert.deepStrictEqual(doc.data, null)

        await transaction.commit()
    })

    it('runTransaction with customResult', async () => {
        // 验证自定义成功返回
        const result = await db.runTransaction(async function(transaction) {
            const doc = await transaction
                .collection(collectionName)
                .doc('1')
                .get()
            assert.deepStrictEqual(doc.data, data[0])
            // assert(doc.data)
            return 'luke'
        })

        assert(result === 'luke')
    })

    // runTransaction rollback
    it('rollback within runTransaction', async () => {
        try {
            await db.runTransaction(async function(transaction) {
                const doc = await transaction
                    .collection(collectionName)
                    .doc('1')
                    .get()
                assert.deepStrictEqual(doc.data, data[0])
                await transaction.rollback('luke')
            })
        } catch (err) {
            assert(err === 'luke')
        }

        try {
            await db.runTransaction(async function(transaction) {
                const doc = await transaction
                    .collection(collectionName)
                    .doc('1')
                    .get()
                assert.deepStrictEqual(doc.data, data[0])
                await transaction.rollback()
            })
        } catch (err) {
            assert(err === undefined)
        }

        try {
            await db.runTransaction(async transaction => {
                const doc = await transaction
                    .collection(collectionName)
                    .doc('1')
                    .get()
                assert.deepStrictEqual(doc.data, data[0])
                // mock 事务冲突
                throw {
                    code: 'DATABASE_TRANSACTION_CONFLICT',
                    message:
                        '[ResourceUnavailable.TransactionConflict] Transaction is conflict, maybe resource operated by others. Please check your request, but if the problem persists, contact us.'
                }
            })
        } catch (e) {
            assert(e.code === 'DATABASE_TRANSACTION_CONFLICT')
        }

        try {
            const docRef1 = db.collection(collectionName).doc('1')
            await db.runTransaction(async transaction => {
                const doc = await transaction
                    .collection(collectionName)
                    .doc('1')
                    .get()
                await docRef1.set({
                    category: 'wwwwwwwwwwwwwwwww'
                })
                const res = await transaction
                    .collection(collectionName)
                    .doc('1')
                    .update({
                        category: 'transactiontransactiontransaction'
                    })
            })
        } catch (e) {
            // 因为mongo write conflict时会自动rollback,兜底的rollback会报错  非conflict错误
            assert(e.code)
            // assert(e.code === 'DATABASE_TRANSACTION_CONFLICT')
        }
    })

    it('delete doc and abort', async () => {
        // 前面测试用例删除了 _id = 2 的数据
        const docRef = db.collection(collectionName).doc('3')
        const transaction = await db.startTransaction()
        // let doc = await transaction.get(docRef)
        let doc = await transaction
            .collection(collectionName)
            .doc('3')
            .get()

        // const deleteResult = await transaction.delete(docRef)
        const deleteResult = await transaction
            .collection(collectionName)
            .doc('3')
            .delete()
        assert.strictEqual(deleteResult.deleted, 1)

        // doc = await transaction.get(docRef)
        doc = await transaction
            .collection(collectionName)
            .doc('3')
            .get()
        assert.deepStrictEqual(doc.data, null)

        await transaction.rollback()

        const res = await docRef.get()
        // const res = await transaction.collection(collectionName).doc('3').get()
        assert.deepStrictEqual(res.data[0], data[2])
    })

    it('事务提交后, 不能进行其它操作', async () => {
        // const docRef = db.collection(collectionName).doc('1')
        const transaction = await db.startTransaction()
        await transaction.commit()

        await assert.rejects(
            async () => {
                // await transaction.set(docRef, {
                //   category: 'Node.js'
                // })
                await transaction
                    .collection(collectionName)
                    .doc('1')
                    .set({
                        category: 'Node.js'
                    })
            },
            {
                code: 'DATABASE_TRANSACTION_FAIL',
                message:
                    '[ResourceUnavailable.TransactionNotExist] Transaction does not exist on the server, transaction must be commit or abort in 30 seconds. Please check your request, but if the problem persists, contact us.'
            }
        )
    })

    it('冲突检测', async () => {
        // const docRef = db.collection(collectionName).doc('1')
        const transaction1 = await db.startTransaction(),
            transaction2 = await db.startTransaction()

        // 事务1先读取数据
        // const doc = await transaction1.get(docRef)
        const doc = await transaction1
            .collection(collectionName)
            .doc('1')
            .get()

        // 事务2更改之前事务1读取的数据，并且提交
        // await transaction2.update(docRef, {
        //   category: '冲突检测'
        // })
        await transaction2
            .collection(collectionName)
            .doc('1')
            .update({
                category: '冲突检测'
            })

        // 由于事务1读取的数据没有时效性，故报错
        await assert.rejects(
            async () => {
                // await transaction1.update(docRef, {
                //   category: doc.data.category + '冲突检测'
                // })
                await transaction1
                    .collection(collectionName)
                    .doc('1')
                    .update({
                        category: doc.data.category + '冲突检测'
                    })
            },
            {
                code: 'DATABASE_TRANSACTION_CONFLICT'
            }
        )

        await transaction2.commit()
    })

    it('读快照', async () => {
        const docRef = db.collection(collectionName).doc('1')

        // 启动事务
        const transaction = await db.startTransaction()

        // 修改数据
        // await transaction.update(docRef, {
        //   category: 'update in transaction'
        // })
        await transaction
            .collection(collectionName)
            .doc('1')
            .update({
                category: 'update in transaction'
            })
        const result = await docRef.get()

        // 事务读，读的是开始时刻的快照
        // const doc_new = await transaction.get(docRef)
        const doc_new = await transaction
            .collection(collectionName)
            .doc('1')
            .get()
        assert.deepStrictEqual(result.data[0], data[0])
        assert.deepStrictEqual(doc_new.data, {
            ...data[0],
            category: 'update in transaction'
        })

        await transaction.rollback()
    })

    it('读偏', async () => {
        const docRef1 = db.collection(collectionName).doc('1')
        const docRef2 = db.collection(collectionName).doc('2')

        // 启动事务
        const transaction = await db.startTransaction()

        // 修改数据
        // console.log(await transaction.get(docRef1))
        await transaction
            .collection(collectionName)
            .doc('1')
            .get()

        await docRef1.set({
            category: 'wwwwwwwwwwwwwwwww'
        })
        await docRef2.set({
            category: 'hhhhhhhhhhhhhhh'
        })

        // 事务读，读的是开始时刻的快照
        // const snapshot1 = await transaction.get(docRef1)
        // const snapshot2 = await transaction.get(docRef2)
        const snapshot1 = await transaction
            .collection(collectionName)
            .doc('1')
            .get()
        const snapshot2 = await transaction
            .collection(collectionName)
            .doc('2')
            .get()

        assert.deepStrictEqual(snapshot1.data, data[0])
        assert.deepStrictEqual(snapshot2.data, data[1])

        // 外部已经修改了数据，事务内修改应该失败
        await assert.rejects(
            async () => {
                // await transaction.update(docRef1, {
                //   category: 'transactiontransactiontransaction'
                // })
                await transaction
                    .collection(collectionName)
                    .doc('1')
                    .update({
                        category: 'transactiontransactiontransaction'
                    })
            },
            {
                code: 'DATABASE_TRANSACTION_CONFLICT',
                message:
                    '[ResourceUnavailable.TransactionConflict] Transaction is conflict, maybe resource operated by others. Please check your request, but if the problem persists, contact us.'
            }
        )
    })

    it('write skew', async () => {
        const docRef1 = db.collection(collectionName).doc('1')
        const docRef2 = db.collection(collectionName).doc('2')
        const transaction1 = await db.startTransaction()
        const transaction2 = await db.startTransaction()

        // 事务1：读1写2
        // 事务2：读2写1
        // const doc1 = await transaction1.get(docRef1)
        // const doc2 = await transaction2.get(docRef2)
        const doc1 = await transaction1
            .collection(collectionName)
            .doc('1')
            .get()
        const doc2 = await transaction2
            .collection(collectionName)
            .doc('2')
            .get()

        // await transaction1.set(docRef2, {
        //   category: doc1.data.category + 'doc1'
        // })
        // await transaction2.set(docRef1, {
        //   category: doc2.data.category + 'doc2'
        // })

        await transaction1
            .collection(collectionName)
            .doc('2')
            .set({
                category: doc1.data.category + 'doc1'
            })
        await transaction2
            .collection(collectionName)
            .doc('1')
            .set({
                category: doc2.data.category + 'doc2'
            })

        // 由于事务2读取的数据没有时效性，故报错
        try {
            await transaction1.commit()
            await transaction2.commit()
        } catch (error) {
            console.log(error)
        }

        console.log(await docRef1.get())
        console.log(await docRef2.get())
    })

    it('mongodb 原生事务操作支持', async () => {
        await db.runTransaction(async function(transaction) {
            const unique = Date.now()
            await db.collection(collectionName)
                    .add([{
                        key: "a",
                        value: unique
                    }])

            const res1 = await transaction
                .collection(collectionName)
                .options({ raw: true })
                .where({ key: { $eq: "a"}})
                .get()
            assert(res1.data.length > 0)

            const res2 = await transaction
                .collection(collectionName)
                .options({ raw: true })
                .where({ key: { $eq: "a" }, value: { $eq: unique }})
                .update({ $set: { value: unique+1 }})
            assert(res2.updated === 1)
        })
    })
})
