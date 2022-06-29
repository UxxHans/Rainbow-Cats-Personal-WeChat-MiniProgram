import * as assert from 'power-assert'
import tcb from '../../../src/index'
import * as Config from '../../config.local'
import * as common from '../../common/index'

const app = tcb.init(Config)
const db = app.database()
const _ = db.command
const $ = db.command.aggregate

describe('projection', () => {
    const collName1 = 'test-lookup-pipeline1'
    const collName2 = 'test-lookup-pipeline2'
    let collection1 = null
    let collection2 = null
    const data = [
        { category: 'Web', tags: ['JavaScript', 'C#'] },
        { category: 'Web', tags: ['Go', 'C#'] },
        { category: 'Life', tags: ['Go', 'Python', 'JavaScript'] }
    ]

    beforeAll(async () => {
        collection1 = await common.safeCollection(db, collName1)
        await collection1.remove()
        await collection1.create(data)

        collection2 = await common.safeCollection(db, collName2)
        await collection2.remove()
        await collection2.create(data)
    })

    afterAll(async () => {
        await collection1.remove()
        await collection2.remove()
    })

    it('lookup', async () => {
        const result = await db
            .collection(collName1)
            .aggregate()
            .lookup({
                from: collName2,
                localField: 'category',
                foreignField: 'category',
                as: 'docs'
            })
            .end()
        assert.strictEqual(result.data[0].docs.length, 2)
    })

    it('lookup with pipeline', async () => {
        const result = await db
            .collection(collName1)
            .aggregate()
            .lookup({
                from: collName2,
                pipeline: $.pipeline()
                    .match({
                        category: 'Web'
                    })
                    .done(),
                as: 'docs'
            })
            .end()
        assert.strictEqual(result.data[0].docs.length, 2)
        assert.strictEqual(result.data[1].docs.length, 2)
        assert.strictEqual(result.data[2].docs.length, 2)
    })
})
