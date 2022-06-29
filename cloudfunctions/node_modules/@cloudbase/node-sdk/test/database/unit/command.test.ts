import * as assert from 'power-assert'
import tcb from '../../../src/index'
import * as Config from '../../config.local'
import * as common from '../../common/index'

const app = tcb.init(Config)
const db = app.database()

describe.skip('test/unit/collection.test.ts', () => {
    const collName = 'coll-1'
    const collection = db.collection(collName)
    const command = db.command
    const _ = command

    it('operator', async () => {
        let a
        a = _.gt(4)
        const result = await collection.where({ a }).update({ c: { d: _.mul(3) } })
    })
})

describe('stdDevPop', () => {
    let studentsCollection = null
    const collectionName = 'test-students'
    const data = [
        { group: 'a', score: 84 },
        { group: 'a', score: 96 },
        { group: 'b', score: 80 },
        { group: 'b', score: 100 }
    ]

    beforeAll(async () => {
        studentsCollection = await common.safeCollection(db, collectionName)
        const success = await studentsCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await studentsCollection.remove()
        assert.strictEqual(success, true)
    })

    it('计算不同组的标准差', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .group({
                _id: '$group',
                stdDev: $.stdDevPop('$score')
            })
            .end()
        const stdDevs = {
            a: null,
            b: null
        }
        result.data.forEach(item => (stdDevs[item._id] = item.stdDev))
        // a分组标准差为: 6; b分组标准差为: 10
        assert.strictEqual(stdDevs.a, 6)
        assert.strictEqual(stdDevs.b, 10)
    })
})

describe('stdDevSamp', () => {
    let studentsCollection = null
    const collectionName = 'test-students'
    const data = [{ score: 80 }, { score: 100 }]

    beforeAll(async () => {
        studentsCollection = await common.safeCollection(db, collectionName)
        const success = await studentsCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await studentsCollection.remove()
        assert.strictEqual(success, true)
    })

    it('计算标准样本偏差', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .group({
                _id: null,
                ageStdDev: $.stdDevSamp('$score')
            })
            .end()
        // data 的标准样本偏差为 14.14
        assert.strictEqual(result.data[0].ageStdDev.toFixed(2), '14.14')
    })
})

describe('sum', () => {
    let goodsCollection = null
    const $ = db.command.aggregate
    const collectionName = 'test-goods'
    const data = [
        { cost: -10, price: 100 },
        { cost: -15, price: 1 },
        { cost: -10, price: 10 }
    ]

    beforeAll(async () => {
        goodsCollection = await common.safeCollection(db, collectionName)
        const success = await goodsCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await goodsCollection.remove()
        assert.strictEqual(success, true)
    })

    it('参数为单独字段', async () => {
        const result = await db
            .collection(collectionName)
            .aggregate()
            .group({
                _id: null,
                totalPrice: $.sum('$price')
            })
            .end()
        assert.strictEqual(result.data[0].totalPrice, 111)
    })

    it('参数为字段列表', async () => {
        const result = await db
            .collection(collectionName)
            .aggregate()
            .group({
                _id: null,
                totalProfit: $.sum($.sum(['$price', '$cost']))
            })
            .end()
        assert.strictEqual(result.data[0].totalProfit, 76)
    })
})

describe('let', () => {
    let goodsCollection = null
    const $ = db.command.aggregate
    const collectionName = 'test-goods'
    const data = [
        { cost: -10, discount: 0.95, price: 100 },
        { cost: -15, discount: 0.98, price: 1 },
        { cost: -10, discount: 1, price: 10 }
    ]

    beforeAll(async () => {
        goodsCollection = await common.safeCollection(db, collectionName)
        const success = await goodsCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await goodsCollection.remove()
        assert.strictEqual(success, true)
    })

    it('参数为单独字段', async () => {
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                profit: $.let({
                    vars: {
                        priceTotal: $.multiply(['$price', '$discount'])
                    },
                    in: $.sum(['$$priceTotal', '$cost'])
                })
            })
            .end()
        assert.strictEqual(result.data.length, 3)
    })
})

describe('条件操作符', () => {
    let goodsCollection = null
    const $ = db.command.aggregate
    const collectionName = 'test-goods'
    const data = [
        { name: 'a', amount: 100, desc: 'A' },
        { name: 'b', amount: 200, desc: null },
        { name: 'c', amount: 300 }
    ]

    beforeAll(async () => {
        goodsCollection = await common.safeCollection(db, collectionName)
        const success = await goodsCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await goodsCollection.remove()
        assert.strictEqual(success, true)
    })

    it('cond', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                name: 1,
                discount: $.cond({
                    if: $.gte(['$amount', 200]),
                    then: 0.7,
                    else: 0.9
                })
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { name: 'a', discount: 0.9 },
            { name: 'b', discount: 0.7 },
            { name: 'c', discount: 0.7 }
        ])
    })

    it('ifNull', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                name: 1,
                desc: $.ifNull(['$desc', 'Not defined'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { desc: 'A', name: 'a' },
            { desc: 'Not defined', name: 'b' },
            { desc: 'Not defined', name: 'c' }
        ])
    })

    it('switch', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                name: 1,
                discount: $.switch({
                    branches: [
                        { case: $.gt(['$amount', 250]), then: 0.8 },
                        { case: $.gt(['$amount', 150]), then: 0.9 }
                    ],
                    default: 1
                })
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { name: 'a', discount: 1 },
            { name: 'b', discount: 0.9 },
            { name: 'c', discount: 0.8 }
        ])
    })
})

describe('group操作符', () => {
    let studentsCollection = null,
        passagesCollection = null
    const $ = db.command.aggregate

    const studentsName = 'test-students'
    const studentsData = [
        { group: 'a', name: 'stu1', score: 84 },
        { group: 'a', name: 'stu2', score: 96 },
        { group: 'b', name: 'stu3', score: 80 },
        { group: 'b', name: 'stu4', score: 100 }
    ]
    const passagesName = 'test-passages'
    const passagesData = [
        { category: 'web', tags: ['JavaScript', 'CSS'], title: 'title1' },
        { category: 'System', tags: ['C++', 'C'], title: 'title2' }
    ]

    beforeAll(async () => {
        studentsCollection = await common.safeCollection(db, studentsName)
        passagesCollection = await common.safeCollection(db, passagesName)
        assert.strictEqual(await studentsCollection.create(studentsData), true)
        assert.strictEqual(await passagesCollection.create(passagesData), true)
    })

    afterAll(async () => {
        assert.strictEqual(await studentsCollection.remove(), true)
        assert.strictEqual(await passagesCollection.remove(), true)
    })

    it('push', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .group({
                _id: '$group',
                students: $.push({
                    name: '$name',
                    score: '$score'
                })
            })
            .end()
        const valid = result.data.every(item => 'students' in item)
        assert.strictEqual(valid, true)
    })

    it('max', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .group({
                _id: '$group',
                maxScore: $.max('$score')
            })
            .end()

        assert.strictEqual(result.data.length, 2)
    })

    it('min', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .group({
                _id: '$group',
                minScore: $.min('$score')
            })
            .end()

        assert.strictEqual(result.data.length, 2)
    })

    it('last', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .sort({
                score: 1
            })
            .group({
                _id: null,
                max: $.last('$score')
            })
            .end()

        assert(result.data[0].max, 100)
    })

    it('first', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .sort({
                score: 1
            })
            .group({
                _id: null,
                min: $.first('$score')
            })
            .end()

        assert(result.data[0].min, 80)
    })

    it('avg', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .group({
                _id: null,
                average: $.avg('$score')
            })
            .end()

        assert(result.data[0].average, 90)
    })

    describe('addToSet', async () => {
        it('非数组字段', async () => {
            const result = await db
                .collection(passagesName)
                .aggregate()
                .group({
                    _id: null,
                    categories: $.addToSet('$category')
                })
                .end()

            assert(result.data[0].categories.length, 2)
        })

        it('数组字段', async () => {
            const result = await db
                .collection(passagesName)
                .aggregate()
                .group({
                    _id: null,
                    tagsList: $.addToSet('$tags')
                })
                .end()
            const valid = result.data.some(item => Array.isArray(item.tagsList))
            assert(valid, true)
        })
    })
})

describe('字面量操作符', () => {
    let goodsCollection = null
    const $ = db.command.aggregate
    const collectionName = 'test-goods'
    const data = [{ price: '$1' }, { price: '$2.50' }, { price: '$3.60' }, { price: '$4.60' }]

    beforeAll(async () => {
        goodsCollection = await common.safeCollection(db, collectionName)
        const success = await goodsCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await goodsCollection.remove()
        assert.strictEqual(success, true)
    })

    it('以字面量的形式使用$', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                isOneDollar: $.eq(['$price', $.literal('$1')])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { isOneDollar: true },
            { isOneDollar: false },
            { isOneDollar: false },
            { isOneDollar: false }
        ])
    })

    it('投影一个字段，对应的值为1', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                price: 1,
                amount: $.literal(1)
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { amount: 1, price: '$1' },
            { amount: 1, price: '$2.50' },
            { amount: 1, price: '$3.60' },
            { amount: 1, price: '$4.60' }
        ])
    })
})

describe('字符串操作符', () => {
    let studentsCollection = null,
        personCollection = null
    const $ = db.command.aggregate

    const studentsName = 'test-students'
    const studentsData = [
        {
            birthday: '1999/12/12',
            date: new Date('1999/12/12'),
            firstName: 'Yuanxin',
            group: 'a',
            lastName: 'Dong',
            score: 84
        },
        {
            birthday: '1998/11/11',
            date: new Date('1998/11/11'),
            firstName: 'Weijia',
            group: 'a',
            lastName: 'Wang',
            score: 96
        },
        {
            birthday: '1997/10/10',
            date: new Date('1997/10/10'),
            firstName: 'Chengxi',
            group: 'b',
            lastName: 'Li',
            score: 80
        }
    ]

    const personName = 'test-person'
    const personData = [{ name: 'dongyuanxin', nickname: '心谭' }]

    beforeAll(async () => {
        studentsCollection = await common.safeCollection(db, studentsName)
        personCollection = await common.safeCollection(db, personName)
        assert.strictEqual(await studentsCollection.create(studentsData), true)
        assert.strictEqual(await personCollection.create(personData), true)
    })

    afterAll(async () => {
        assert.strictEqual(await studentsCollection.remove(), true)
        assert.strictEqual(await personCollection.remove(), true)
    })

    it('concat', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .project({
                _id: 0,
                fullName: $.concat(['$firstName', ' ', '$lastName'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { fullName: 'Yuanxin Dong' },
            { fullName: 'Weijia Wang' },
            { fullName: 'Chengxi Li' }
        ])
    })

    describe('dateToString', async () => {
        it('格式化日期', async () => {
            const result = await db
                .collection(studentsName)
                .aggregate()
                .project({
                    _id: 0,
                    formatDate: $.dateToString({
                        date: '$date',
                        format: '%Y-%m-%d'
                    })
                })
                .end()
            assert.deepStrictEqual(result.data, [
                { formatDate: '1999-12-11' },
                { formatDate: '1998-11-10' },
                { formatDate: '1997-10-09' }
            ])
        })

        it('时区时间', async () => {
            const result = await db
                .collection(studentsName)
                .aggregate()
                .project({
                    _id: 0,
                    formatDate: $.dateToString({
                        date: '$date',
                        format: '%H:%M:%S',
                        timezone: 'Asia/Shanghai'
                    })
                })
                .end()
            const valid = result.data.every(item => item.formatDate === '00:00:00')
            assert.ok(valid)
        })

        it('缺失情况的默认值', async () => {
            const result = await db
                .collection(studentsName)
                .aggregate()
                .project({
                    _id: 0,
                    formatDate: $.dateToString({
                        date: '$empty',
                        onNull: 'null'
                    })
                })
                .end()
            const valid = result.data.every(item => item.formatDate === 'null')
            assert.ok(valid)
        })
    })

    it('indexOfBytes', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .project({
                _id: 0,
                aStrIndex: $.indexOfBytes(['$firstName', 'a'])
            })
            .end()
        assert.deepStrictEqual(result.data, [{ aStrIndex: 2 }, { aStrIndex: 5 }, { aStrIndex: -1 }])
    })

    it('indexOfCP', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .project({
                _id: 0,
                aStrIndex: $.indexOfCP(['$firstName', 'a'])
            })
            .end()
        assert.deepStrictEqual(result.data, [{ aStrIndex: 2 }, { aStrIndex: 5 }, { aStrIndex: -1 }])
    })

    it('split', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .project({
                _id: 0,
                birthday: $.split(['$birthday', '/'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { birthday: ['1999', '12', '12'] },
            { birthday: ['1998', '11', '11'] },
            { birthday: ['1997', '10', '10'] }
        ])
    })

    it('strcasecmp', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .project({
                _id: 0,
                result: $.strcasecmp(['$firstName', '$lastName'])
            })
            .end()
        assert.deepStrictEqual(result.data, [{ result: 1 }, { result: 1 }, { result: -1 }])
    })

    it.skip('strLenBytes', async () => {
        const result = await db
            .collection(personName)
            .aggregate()
            .project({
                _id: 0,
                nameLength: $.strLenBytes('$name'),
                nicknameLength: $.strLenBytes('$nickname')
            })
            .end()
        assert.deepStrictEqual(result.data, [{ nameLength: 11, nicknameLength: 6 }])
    })

    it.skip('strLenCP', async () => {
        const result = await db
            .collection(personName)
            .aggregate()
            .project({
                _id: 0,
                nameLength: $.strLenCP('$name'),
                nicknameLength: $.strLenCP('$nickname')
            })
            .end()
        assert.deepStrictEqual(result.data, [{ nameLength: 11, nicknameLength: 2 }])
    })

    it('substr', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .project({
                _id: 0,
                year: $.substr(['$birthday', 0, 4]),
                month: $.substr(['$birthday', 5, 2]),
                day: $.substr(['$birthday', 8, -1])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { day: '12', month: '12', year: '1999' },
            { day: '11', month: '11', year: '1998' },
            { day: '10', month: '10', year: '1997' }
        ])
    })

    it('substrBytes', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .project({
                _id: 0,
                year: $.substrBytes(['$birthday', 0, 4]),
                month: $.substrBytes(['$birthday', 5, 2]),
                day: $.substrBytes(['$birthday', 8, -1])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { day: '12', month: '12', year: '1999' },
            { day: '11', month: '11', year: '1998' },
            { day: '10', month: '10', year: '1997' }
        ])
    })

    test.skip('substrCP', async () => {
        const result = await db
            .collection(personName)
            .aggregate()
            .project({
                _id: 0,
                firstCh: $.substrCP(['$nickname', 0, 1])
            })
            .end()
        assert.deepStrictEqual(result.data, [{ firstCh: '心' }])
    })

    test('toLower', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .project({
                _id: 0,
                result: $.toLower('$firstName')
            })
            .end()

        assert.deepStrictEqual(result.data, [
            { result: 'yuanxin' },
            { result: 'weijia' },
            { result: 'chengxi' }
        ])
    })

    test('toUpper', async () => {
        const result = await db
            .collection(studentsName)
            .aggregate()
            .project({
                _id: 0,
                result: $.toUpper('$lastName')
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { result: 'DONG' },
            { result: 'WANG' },
            { result: 'LI' }
        ])
    })
})

describe('mergeObjects', () => {
    let goodsCollection = null
    const $ = db.command.aggregate
    const collectionName = 'test-goods'
    const data = [
        { name: 'A', foo: { a: 1 }, bar: { b: 2 } },
        { name: 'A', foo: { c: 1 }, bar: { d: 2 } },
        { name: 'A', foo: { e: 1 }, bar: { f: 2 } }
    ]

    beforeAll(async () => {
        goodsCollection = await common.safeCollection(db, collectionName)
        const success = await goodsCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await goodsCollection.remove()
        assert.strictEqual(success, true)
    })

    it('在group中使用', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .group({
                _id: '$name',
                mergedFoo: $.mergeObjects('$foo'),
                mergeBar: $.mergeObjects('$bar')
            })
            .end()
        assert.deepStrictEqual(result.data, [
            {
                _id: 'A',
                mergedFoo: { a: 1, c: 1, e: 1 },
                mergeBar: { b: 2, d: 2, f: 2 }
            }
        ])
    })

    it('在group以外使用', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                foobar: $.mergeObjects(['$foo', '$bar'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { foobar: { a: 1, b: 2 } },
            { foobar: { c: 1, d: 2 } },
            { foobar: { e: 1, f: 2 } }
        ])
    })
})

describe('集合操作', () => {
    let goodsCollection = null
    const $ = db.command.aggregate
    const collectionName = 'test-goods'
    const data = [
        { arr: [true] },
        { arr: [] },
        { arr: [true, false] },
        { arr: [1] },
        { arr: [1, 0] },
        { arr: ['stark'] }
    ]

    beforeAll(async () => {
        goodsCollection = await common.safeCollection(db, collectionName)
        const success = await goodsCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await goodsCollection.remove()
        assert.strictEqual(success, true)
    })

    it('allElementsTrue', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                allElementsTrue: $.allElementsTrue(['$arr'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { allElementsTrue: true },
            { allElementsTrue: true },
            { allElementsTrue: false },
            { allElementsTrue: true },
            { allElementsTrue: false },
            { allElementsTrue: true }
        ])
    })

    it('anyElementTrue', async () => {
        const $ = db.command.aggregate
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                anyElementTrue: $.anyElementTrue(['$arr'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { anyElementTrue: true },
            { anyElementTrue: false },
            { anyElementTrue: true },
            { anyElementTrue: true },
            { anyElementTrue: true },
            { anyElementTrue: true }
        ])
    })
})

describe('集合操作2', () => {
    let goodsCollection = null
    const $ = db.command.aggregate
    const collectionName = 'test-goods'
    const data = [
        { A: [1, 2], B: [1, 2] },
        { A: [1, 2], B: [2, 1, 2] },
        { A: [1, 2], B: [1, 2, 3] },
        { A: [1, 2], B: [3, 1] },
        { A: [1, 2], B: [] },
        { A: [1, 2], B: [{}, []] },
        { A: [], B: [] },
        { A: [], B: [1] }
    ]

    beforeAll(async () => {
        goodsCollection = await common.safeCollection(db, collectionName)
        const success = await goodsCollection.create(data)
        assert.strictEqual(success, true)
    })

    afterAll(async () => {
        const success = await goodsCollection.remove()
        assert.strictEqual(success, true)
    })

    it('setDifference', async () => {
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                isBOnly: $.setDifference(['$B', '$A'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { isBOnly: [] },
            { isBOnly: [] },
            { isBOnly: [3] },
            { isBOnly: [3] },
            { isBOnly: [] },
            { isBOnly: [{}, []] },
            { isBOnly: [] },
            { isBOnly: [1] }
        ])
    })

    it('setEquals', async () => {
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                sameElements: $.setEquals(['$A', '$B'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { sameElements: true },
            { sameElements: true },
            { sameElements: false },
            { sameElements: false },
            { sameElements: false },
            { sameElements: false },
            { sameElements: true },
            { sameElements: false }
        ])
    })

    it('setIntersection', async () => {
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                setIntersection: $.setIntersection(['$A', '$B'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { setIntersection: [1, 2] },
            { setIntersection: [1, 2] },
            { setIntersection: [1, 2] },
            { setIntersection: [1] },
            { setIntersection: [] },
            { setIntersection: [] },
            { setIntersection: [] },
            { setIntersection: [] }
        ])
    })

    it('setIsSubset', async () => {
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                setIsSubset: $.setIsSubset(['$A', '$B'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { setIsSubset: true },
            { setIsSubset: true },
            { setIsSubset: true },
            { setIsSubset: false },
            { setIsSubset: false },
            { setIsSubset: false },
            { setIsSubset: true },
            { setIsSubset: true }
        ])
    })

    it('setUnion', async () => {
        const result = await db
            .collection(collectionName)
            .aggregate()
            .project({
                _id: 0,
                setUnion: $.setUnion(['$A', '$B'])
            })
            .end()
        assert.deepStrictEqual(result.data, [
            { setUnion: [1, 2] },
            { setUnion: [1, 2] },
            { setUnion: [1, 2, 3] },
            { setUnion: [1, 2, 3] },
            { setUnion: [1, 2] },
            { setUnion: [1, 2, {}, []] },
            { setUnion: [] },
            { setUnion: [1] }
        ])
    })
})
