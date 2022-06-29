import * as assert from 'power-assert'
import tcb from '../../../src/index'
import * as Config from '../../config.local'
import * as common from '../../common/index'

const app = tcb.init(Config)
const db = app.database()
const _ = db.command

const collName = 'db-test-query-date'
let passagesCollection = null
const data = [
    { date: new Date(1565314149491) },
    { date: new Date(1565314249491) },
    { date: new Date(1565314349491) },
    { date: db.serverDate() }
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

describe('query date', () => {
    it('直接匹配', async () => {
        let result = await db
            .collection(collName)
            .where({
                date: new Date(1565314149491)
            })
            .get()
        assert(result.data.length, 1)
    })

    it('eq', async () => {
        let result = await db
            .collection(collName)
            .where({
                date: _.eq(new Date(1565314149491))
            })
            .get()
        assert(result.data.length, 1)
    })

    it('gte', async () => {
        let result = await db
            .collection(collName)
            .where({
                date: _.lte(new Date(1565314349491))
            })
            .get()
        assert(result.data.length, 3)
    })
})
