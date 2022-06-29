import * as config from '../config.local'
import { create } from 'domain'

export async function safeCreateCollection(db, name) {
    return db.createCollection(name)
}

export async function timer(time: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

export async function safeCollection(db, name) {
    const collection = db.collection(name)
    let num = -1

    // 检查collection是否存在
    try {
        const res = await collection.where({}).get()
        // collection存在 且有数据 则删除当前collection中所有doc
        if (res.data.length) {
            await collection
                .where({
                    _id: /.*/
                })
                .remove()
        }
    } catch (e) {
        if (e.code === 'DATABASE_COLLECTION_NOT_EXIST') {
            // 不存在
            await db.createCollection(name)
        }
    }

    return {
        async create(data) {
            // await db.createCollection(name)
            const datas = Array.isArray(data) ? data : [data]
            num = datas.length

            let result
            try {
                result = await collection.add(datas)
            } catch (e) {
                // throw e
            }

            // const getRes = await collection.doc(result.id).get()

            if (result.ids.length !== num) {
                throw Error('出现插入数据失败情况了！！')
            }

            return true
        },
        async remove() {
            // 加重试机制
            let flag = false
            let retryTimes = 0
            let result = null
            while (flag !== true && retryTimes++ < 4) {
                result = await collection
                    .where({
                        _id: /.*/
                    })
                    .remove()

                flag = result.deleted >= 0

                if (!flag) {
                    await timer(1200) // 等1.2s
                }
            }

            return flag
        }
    }
}

// module.exports = {
//   safeCreateCollection,
//   safeCollection
// }
