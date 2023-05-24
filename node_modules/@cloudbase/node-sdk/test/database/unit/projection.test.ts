import * as assert from 'power-assert'
import tcb from '../../../src/index'
import * as Config from '../../config.local'
import * as common from '../../common/index'

const app = tcb.init(Config)
const db = app.database()
const _ = db.command

describe('projection', () => {
    const collName = 'db-test-projection'
    let passagesCollection = null
    const data = [
        { category: 'Web', tags: ['JavaScript', 'C#'] },
        { category: 'Web', tags: ['Go', 'C#'] },
        { category: 'Life', tags: ['Go', 'Python', 'JavaScript'] }
    ]

    beforeAll(async () => {
        passagesCollection = await common.safeCollection(db, collName)
        const success = await passagesCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await passagesCollection.remove()
        assert.strictEqual(success, true)
    })

    it('slice', async () => {
        const result = await db
            .collection(collName)
            .field({
                tags: db.command.project.slice(1)
            })
            .get()
        for (let item of result.data) {
            assert(item.tags.length === 1)
        }
    })

    it('projection true false', async () => {
        const result = await db
            .collection(collName)
            .field({
                category: true
            })
            .get()
        // console.log('result:', result)
        for (let item of result.data) {
            assert(item.category)
        }
        // assert.strictEqual(result.data.length, 3)
    })

    it('projection 1 0', async () => {
        const result1 = await db
            .collection(collName)
            .field({
                category: 0
            })
            .get()
        // 检查回包中没有category
        assert(Object.keys(result1.data[0]).indexOf('category') < 0, true)
    })
})
