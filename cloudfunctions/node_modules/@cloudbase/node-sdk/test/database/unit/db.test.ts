import * as assert from 'power-assert'
import tcb from '../../../src/index'
import * as Config from '../../config.local'

describe('test/unit/db.test.ts', () => {
    const app = tcb.init(Config)
    const db = app.database()
    // const defaultDbName = 'default'

    // it('use default db', () => {
    //   assert(db.config.dbname === defaultDbName)
    // })

    it('get collection reference', () => {
        const collName = 'coll-1'
        const collection = db.collection(collName)
        assert(collection.name === collName)
    })

    it('API - getCollections', async () => {
        const data2 = new db.Geo.Point(23, -67)
        console.log(data2)
    })

    // it('API - getCollections', async () => {
    //   const data = await db.getCollections()
    //   assert(Array.isArray(data.collections))
    // })
})
