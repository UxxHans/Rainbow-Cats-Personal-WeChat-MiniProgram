import * as assert from 'power-assert'
import * as Mock from '../unit/mock'
import tcb from '../../../src/index'
import * as Config from '../../config.local'
import * as common from '../../common/index'

describe('正则表达式查询', () => {
    const app = tcb.init(Config)
    const db = app.database()

    const collName = 'db-test-regex'
    const collection = db.collection(collName)

    const initialData = {
        name: 'AbCdEfxxxxxxxxxxxxxx1234结尾',
        name2: 'fffffffffffffffffff',
        array: [1, 2, 3, [4, 5, 6], { a: 1, b: { c: 'fjasklfljkas', d: false } }],
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

    it('Document - CRUD', async () => {
        // Create
        const res = await collection.add(initialData)
        // const id = res.ids[0]
        const id = res.id
        console.log(res)
        assert(id)
        assert(res.requestId)

        // Read

        // 直接使用正则表达式
        let result = await collection
            .where({
                name: /^abcdef.*\d+结尾$/i
            })
            .get()
        // console.log(result);
        assert(result.data.length > 0)

        // new db.RegExp
        result = await collection
            .where({
                name: new db.RegExp({
                    regexp: '^abcdef.*\\d+结尾$',
                    options: 'i'
                })
            })
            .get()
        assert(result.data.length > 0)

        // db.RegExp
        result = await collection
            .where({
                name: db.RegExp({
                    regexp: '^abcdef.*\\d+结尾$',
                    options: 'i'
                })
            })
            .get()
        assert(result.data.length > 0)

        // 多字段
        result = await collection
            .where({
                name: db.RegExp({
                    regexp: '^abcdef.*\\d+结尾$',
                    options: 'i'
                }),
                name2: /fff/
            })
            .get()
        assert(result.data.length > 0)

        // or
        result = await collection
            .where(
                db.command.or({
                    name: db.RegExp({
                        regexp: '^abcdef.*\\d+结尾$',
                        options: 'i'
                    }),
                    name2: db.RegExp({
                        regexp: 'fffffff',
                        options: 'i'
                    })
                })
            )
            .get()
        assert(result.data.length > 0)

        result = await collection
            .where({
                name: db.command.or(
                    new db.RegExp({
                        regexp: '^abcdef.*\\d+结尾$',
                        options: 'i'
                    }),
                    db.RegExp({
                        regexp: '^fffffff$',
                        options: 'i'
                    })
                )
            })
            .get()
        assert(result.data.length > 0)

        result = await collection
            .where({
                name: db.command.or(
                    db.RegExp({
                        regexp: '^abcdef.*\\d+结尾$',
                        options: 'i'
                    }),
                    db.RegExp({
                        regexp: '^fffffff$',
                        options: 'i'
                    })
                )
            })
            .update({
                name: 'ABCDEFxxxx5678结尾'
            })
        assert(result.updated > 0)

        // Delete
        const deleteRes = await collection
            .where({
                name: db.RegExp({
                    regexp: '^abcdef.*\\d+结尾$',
                    options: 'i'
                })
            })
            .remove()
        assert(deleteRes.deleted > 0)
    })
})
