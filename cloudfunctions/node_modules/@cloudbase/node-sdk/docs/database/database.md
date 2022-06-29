# API

## 基础概念

### Collection

集合是一系列的文档集，通过 `db.collection(name)` 可以获取指定集合的引用，在集合上可以进行以下操作

| 类型     | 接口    | 说明                                                                               |
| -------- | ------- | ---------------------------------------------------------------------------------- |
| 写       | add     | 新增文档（触发请求）                                                               |
| 计数     | count   | 获取复合条件的文档条数                                                             |
| 读       | get     | 获取集合中的文档，如果有使用 where 语句定义查询条件，则会返回匹配结果集 (触发请求) |
| 引用     | doc     | 获取对该集合中指定 id 的文档的引用                                                 |
| 查询条件 | where   | 通过指定条件筛选出匹配的文档，可搭配查询指令（eq, gt, in, ...）使用                |
|          | skip    | 跳过指定数量的文档，常用于分页，传入 offset                                        |
|          | orderBy | 排序方式                                                                           |
|          | limit   | 返回的结果集(文档数量)的限制，有默认值和上限值                                     |
|          | field   | 指定需要返回的字段                                                                 |

查询及更新指令用于在 `where` 中指定字段需满足的条件，指令可通过 `db.command` 对象取得。

### Record / Document

文档是数据库集合中的一个存储单元，在云开发里是一个 json 对象。通过 `db.collection(collectionName).doc(docId)` 可以获取指定集合上指定 id 的文档的引用，在文档上可以进行以下操作

| 接口 | 说明   |
| ---- | ------ |
| 写   | set    | 覆写文档 |
|      | update | 局部更新文档(触发请求) |
|      | remove | 删除文档(触发请求) |
| 读   | get    | 获取文档(触发请求) |

### Query Command

查询指令，应用于构建查询条件。以下指令皆挂载在 `db.command` 下

| 类型     | 接口 | 说明                               |
| -------- | ---- | ---------------------------------- |
| 比较运算 | eq   | 字段 ==                            |
|          | neq  | 字段 !=                            |
|          | gt   | 字段 >                             |
|          | gte  | 字段 >=                            |
|          | lt   | 字段 <                             |
|          | lte  | 字段 <=                            |
|          | in   | 字段值在数组里                     |
|          | nin  | 字段值不在数组里                   |
| 逻辑运算 | and  | 表示需同时满足指定的所有条件       |
|          | or   | 表示需同时满足指定条件中的至少一个 |

### Update Command

更新指令，应用于构建更新操作。以下指令皆挂载在 `db.command` 下

| 类型     | 接口    | 说明                                                    |
| -------- | ------- | ------------------------------------------------------- |
| 更新指令 | set     | 设定字段等于指定值                                      |
|          | inc     | 指示字段自增某个值                                      |
|          | mul     | 指示字段自乘某个值                                      |
|          | remove  | 删除某个字段                                            |
|          | push    | 向数组尾部追加元素，支持传入单个元素或数组              |
|          | pop     | 删除数组尾部元素                                        |
|          | shift   | 删除数组头部元素。使用同 pop                            |
|          | unshift | 向数组头部添加元素，支持传入单个元素或数组。使用同 push |

## 获取数据库实例

说明：不需要参数，返回数据库的实例

```js
// 初始化
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
```

## 获取集合的引用

说明：接受一个 name 参数，指定需引用的集合名称

```js
// 获取 `user` 集合的引用
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})

const db = app.database()

const collection = db.collection('user')
```

## 查询指令

### eq

表示字段等于某个值。`eq` 指令接受一个字面量 (literal)，可以是 `number`, `boolean`, `string`, `object`, `array`。

比如筛选出所有自己发表的文章，除了用传对象的方式：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    const myOpenID = 'xxx'
    const res = await db
        .collection('articles')
        .where({
            _openid: myOpenID
        })
        .get()

    console.log(res.data) // 打印查询的文档数组

    // 用指令的方式
    const res1 = await db
        .collection('articles')
        .where({
            _openid: _.eq(myOpenID)
        })
        .get()

    console.log(res1.data) // 打印查询的文档数组
}
```

注意 `eq` 指令比对象的方式有更大的灵活性，可以用于表示字段等于某个对象的情况，比如：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    // 这种写法表示匹配 stat.publishYear == 2018 且 stat.language == 'zh-CN'
    const res = await db
        .collection('articles')
        .where({
            stat: {
                publishYear: 2018,
                language: 'zh-CN'
            }
        })
        .get()

    console.log(res.data) // 打印查询的文档数组

    // 这种写法表示 stat 对象等于 { publishYear: 2018, language: 'zh-CN' }
    const res1 = await db
        .collection('articles')
        .where({
            stat: _.eq({
                publishYear: 2018,
                language: 'zh-CN'
            })
        })
        .get()

    console.log(res1.data) // 打印查询的文档数组
}
```

### neq

字段不等于。`neq` 指令接受一个字面量 (literal)，可以是 `number`, `boolean`, `string`, `object`, `array`。

如筛选出品牌不为 X 的计算机：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                brand: _.neq('X')
            }
        })
        .get()

    console.log(res.data) // 打印查询的文档数组
}
```

### gt

字段大于指定值。

如筛选出价格大于 2000 的计算机：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('goods')
        .where({
            category: 'computer',
            price: _.gt(2000)
        })
        .get()

    console.log(res.data) // 打印查询的文档数组
}
```

### gte

字段大于或等于指定值。

### lt

字段小于指定值。

### lte

字段小于或等于指定值。

### in

字段值在给定的数组中。

筛选出内存为 8g 或 16g 的计算机商品：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                memory: _.in([8, 16])
            }
        })
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

### nin

字段值不在给定的数组中。

筛选出内存不是 8g 或 16g 的计算机商品：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                memory: _.nin([8, 16])
            }
        })
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

### and

表示需同时满足指定的两个或以上的条件。

如筛选出内存大于 4g 小于 32g 的计算机商品：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    // 流式写法
    const res = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                memory: _.gt(4).and(_.lt(32))
            }
        })
        .get()

    console.log(res.data) // 打印查询的文档数组

    // 前置写法
    const res1 = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                memory: _.and(_.gt(4), _.lt(32))
            }
        })
        .get()

    console.log(res1.data) // 打印查询的文档数组
}
```

### or

表示需满足所有指定条件中的至少一个。如筛选出价格小于 4000 或在 6000-8000 之间的计算机：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    //流式写法：
    const res = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                price: _.lt(4000).or(_.gt(6000).and(_.lt(8000)))
            }
        })
        .get()
    console.log(res.data) // 打印查询的文档数组

    // 前置写法
    const res1 = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                price: _.or(_.lt(4000), _.and(_.gt(6000), _.lt(8000)))
            }
        })
        .get()

    console.log(res1.data) // 打印查询的文档数组

    // 如果要跨字段 “或” 操作：(如筛选出内存 8g 或 cpu 3.2 ghz 的计算机)
    const res2 = await db
        .collection('goods')
        .where(
            _.or(
                {
                    type: {
                        memory: _.gt(8)
                    }
                },
                {
                    type: {
                        cpu: 3.2
                    }
                }
            )
        )
        .get()

    console.log(res2.data) // 打印查询的文档数组
}
```

### RegExp

根据正则表达式进行筛选

例如下面可以筛选出 `version` 字段开头是 "数字+s" 的文档，并且忽略大小写：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk');
const app = tcb.init({
  env:'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
  // 可以直接使用正则表达式
  const res = await db.collection('articles').where({
    version: /^\ds/i
  }).get()

  console.log(res.data) // 打印查询的文档数组

  // 或者
  const res1 = await db.collection('articles').where({
    version: new db.RegExp({
      regexp: '^\\ds'   // 正则表达式为 /^\ds/，转义后变成 '^\\ds'
      options: 'i'    // i表示忽略大小写
    })
  }).get()

  console.log(res1.data) // 打印查询的文档数组
}
```

## 更新指令

### set

描述：用于设定字段等于指定值。这种方法相比传入纯 JS 对象的好处是能够指定字段等于一个对象。

示例代码：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('photo')
        .doc('doc-id')
        .update({
            data: {
                style: _.set({
                    color: 'red',
                    size: 'large'
                })
            }
        })
    console.log(res.updated) // 打印更新成功的文档数量
}
```

### inc

描述：用于指示字段自增某个值，这是个原子操作，使用这个操作指令而不是先读数据、再加、再写回的好处是：

备注：

1. 原子性：多个用户同时写，对数据库来说都是将字段加一，不会有后来者覆写前者的情况
2. 减少一次网络请求：不需先读再写

之后的 mul 指令同理。

示例代码：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('user')
        .where({
            _openid: 'my-open-id'
        })
        .update({
            count: {
                favorites: _.inc(1)
            }
        })
    console.log(res.updated) // 打印更新成功的文档数量
}
```

### mul

描述：用于指示字段自乘某个值。

### remove

更新指令。用于表示删除某个字段。如某人删除了自己一条商品评价中的评分：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('comments')
        .doc('comment-id')
        .update({
            rating: _.remove()
        })
    console.log(res.updated) // 打印更新成功的文档数量
}
```

### push

向数组尾部追加元素，支持传入单个元素或数组

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('comments')
        .doc('comment-id')
        .update({
            // users: _.push('aaa')
            users: _.push(['aaa', 'bbb'])
        })
    console.log(res.updated) // 打印更新成功的文档数量
}
```

### pop

删除数组尾部元素

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('comments')
        .doc('comment-id')
        .update({
            users: _.pop()
        })
    console.log(res.updated) // 打印更新成功的文档数量
}
```

### unshift

向数组头部添加元素，支持传入单个元素或数组。使用同 push

### shift

删除数组头部元素。使用同 pop

## 构建查询条件

支持 `where()`、`limit()`、`skip()`、`orderBy()`、`get()`、`update()`、`field()`、`count()` 等操作。

只有当调用`get()`、 `update()`时才会真正发送请求。

### where

描述：设置过滤条件。where 可接收对象作为参数，表示筛选出拥有和传入对象相同的 key-value 的文档。

输入参数： 无

比如筛选出所有类型为计算机的、内存为 8g 的商品：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})

const db = app.database()

exports.main = async (event, context) => {
    const res = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                memory: 8
            }
        })
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

如果要表达更复杂的查询，可使用高级查询指令，比如筛选出所有内存大于 8g 的计算机商品：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk');
const app = tcb.init({
  env:'xxx'
})

const db = app.database();

const _ = db.command // 取指令

exports.main = async (event, context) => {
  const res = await db.collection('goods').where({
    category: 'computer',
    type: {
      memory: _.gt(8), // 表示大于 8
    }
  }).get()
  console.log(res.data) // 打印查询的文档数组
```

### limit

描述：指定查询结果集数量上限

输入参数：

| 参数 | 类型    | 必填 | 说明           |
| ---- | ------- | ---- | -------------- |
| -    | Integer | 是   | 限制展示的数值 |

使用示例

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const collection = db.collection('user') // 例 操作 user 集合

exports.main = async (event, context) => {
    const res = await collection
        .where({})
        .limit(1)
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

### skip

描述：指定查询返回结果时从指定序列后的结果开始返回，常用于分页
输入参数：

| 参数 | 类型    | 必填 | 说明           |
| ---- | ------- | ---- | -------------- |
| -    | Integer | 是   | 限制展示的数值 |

示例代码

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const collection = db.collection('user') // 例 操作 user 集合

exports.main = async (event, context) => {
    const res = await collection
        .where({})
        .skip(4)
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

### field

描述：指定返回结果中文档需返回的字段

输入参数：

| 参数 | 类型   | 必填 | 说明                                      |
| ---- | ------ | ---- | ----------------------------------------- |
| -    | Object | 是   | 要过滤的字段，不返回传 false，返回传 true |

示例代码

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const collection = db.collection('user') // 例 操作 user 集合

exports.main = async (event, context) => {
    const res = await collection
        .where({})
        .field({ age: true })
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

备注：field 方法接受一个必填对象用于指定需返回的字段，对象的各个 key 表示要返回或不要返回的字段，value 传入 true|false（或 1|0）表示要返回还是不要返回。

### orderBy

描述：指定查询排序条件

输入参数：

| 参数      | 类型   | 必填 | 说明                                |
| --------- | ------ | ---- | ----------------------------------- |
| field     | String | 是   | 排序的字段                          |
| orderType | String | 是   | 排序的顺序，升序(asc) 或 降序(desc) |

备注：方法接受一个必填字符串参数 fieldName 用于定义需要排序的字段，一个字符串参数 order 定义排序顺序。order 只能取 asc 或 desc。

如果需要对嵌套字段排序，需要用 "点表示法" 连接嵌套字段，比如 style.color 表示字段 style 里的嵌套字段 color。

同时也支持按多个字段排序，多次调用 orderBy 即可，多字段排序时的顺序会按照 orderBy 调用顺序先后对多个字段排序

示例代码

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const collection = db.collection('user') // 例 操作 user 集合

exports.main = async (event, context) => {
    const res = await collection
        .where({})
        .orderBy('name', 'asc')
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

### options

描述：数据库接口配置

输入参数：

| 参数     | 类型    | 必填 | 说明                                       |
| -------- | ------- | ---- | ------------------------------------------ |
| timeout  | Number  | 否   | SDK 请求超时时间设置, 默认 15000ms         |
| multiple | Boolean | 否   | 是否仅操作单个文档，update/delete 方法可用 |

示例代码

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const collection = db.collection('user') // 例 操作 user 集合

exports.main = async (event, context) => {
    // 更新单文档
    const updateRes = await collection
        .where({ name: 'luke' })
        .options({ multiple: false })
        .update({
            name: 'lake'
        })

    console.log(res.updated === 1) // 更新文档数为1

    // 删除单文档
    const deleteRes = await collection
        .where({ name: 'luke' })
        .options({ multiple: false })
        .remove()

    console.log(res.deleted === 1) // 删除文档数为1

    // 设置SDK单接口请求超时
    const getRes = await collection
        .where({ name: 'luke' })
        .options({ timeout: 10000 })
        .get()
    console.log(getRes)
}
```

## createCollection

#### 1. 接口描述

接口功能：新增集合

接口声明：`createCollection(collName): Promise<Object>`

#### 2. 输入参数

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| -    | String | 是   | 集合名 |

#### 3. 返回结果

| 字段      | 类型   | 必填 | 说明                 |
| --------- | ------ | ---- | -------------------- |
| requestId | String | 是   | 请求 ID              |
| message   | String | 否   | 接口报错时的错误信息 |
| code      | String | 否   | 接口报错时的错误码   |

#### 4. 示例代码

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})

const db = app.database()

exports.main = async (event, context) => {
    // 创建集合名为coll-name的集合
    const res = await db.createCollection('coll-name')

    if (!res.code) {
        // 创建成功
    }
}
```

## add

#### 1. 接口描述

接口功能：插入一条文档或文档数组

接口声明：`collection.add(object: Array<Object> | Object): Promise<Object>`

备注：set 方法也可以用来新增文档，请参看文档更新部分 [set](#update-set) 方法

#### 2. 输入参数

| 参数 | 类型                      | 必填 | 说明                                                                                                                                                |
| ---- | ------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| -    | `Array<Object> or Object` | 是   | 可支持批量插入或插入单个文档，例 [{\_id: '10001', 'name': 'Ben'}, {\_id: '10002', 'name': 'Booker'}] 或 {\_id: '10001', 'name': 'Ben'}, \_id 非必填 |

#### 3. 返回结果

| 字段      | 类型            | 必填 | 说明                            |
| --------- | --------------- | ---- | ------------------------------- |
| code      | String          | 否   | 状态码，操作成功则不返回        |
| message   | String          | 否   | 错误描述，操作成功不返回        |
| requestId | String          | 是   | 请求 ID                         |
| id        | String          | 否   | 文档 ID，插入单文档成功则返回   |
| ids       | `Array<String>` | 否   | 文档 ID，批量插入文档成功则返回 |

#### 4. 示例代码

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})

const db = app.database()
const collection = db.collection('user') // 例 操作 user 集合

exports.main = async (event, context) => {
    // 创建集合名为coll-name的集合
    const res = await collection.add({
        name: 'Ben'
    })

    console.log(res.id) //打印新增的文档ID

    const batchRes = await collection.add([{ name: 'luke' }, { name: 'jimmy' }])
    console.log(batchRes.ids)
}
```

## get

#### 1. 接口描述

接口功能：获取数据库查询结果

接口声明：`get(): Promise<Object>`

注：get()如不指定 limit 则默认取前 100 条数据，且最大取前 100 条数据。

#### 2. 输入参数

空

#### 3. 返回结果

| 字段      | 类型   | 必填 | 说明                     |
| --------- | ------ | ---- | ------------------------ |
| code      | string | 否   | 状态码，操作成功则不返回 |
| message   | string | 否   | 错误描述                 |
| data      | Object | 否   | 操作成功返回查询结果     |
| requestId | string | 是   | 请求序列号，用于错误排查 |

#### 4. 示例代码

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    const res = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                memory: 8
            }
        })
        .count()
    console.log(res.data) // 打印查询的文档数组
}
```

## count

#### 1. 接口描述

接口功能：获取数据库查询结果

接口声明：`cout(): Promise<Object>`

#### 2. 输入参数

空

#### 3. 返回结果

| 字段      | 类型    | 必填 | 说明                     |
| --------- | ------- | ---- | ------------------------ |
| code      | string  | 否   | 状态码，操作成功则不返回 |
| message   | string  | 否   | 错误描述                 |
| total     | integer | 否   | 计数结果                 |
| requestId | string  | 否   | 请求序列号，用于错误排查 |

#### 4. 示例代码

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    const res = await db
        .collection('goods')
        .where({
            category: 'computer',
            type: {
                memory: 8
            }
        })
        .count()
    console.log(res.total) // 打印查询的文档数量
}
```

## remove

#### 1. 接口描述

接口功能：删除一条文档

接口声明：`remove(): Promise<Object>`

#### 2. 输入参数

无

#### 3. 返回结果

| 字段      | 类型    | 必填 | 说明                     |
| --------- | ------- | ---- | ------------------------ |
| code      | string  | 否   | 状态码，操作成功则不返回 |
| message   | string  | 否   | 错误描述                 |
| deleted   | integer | 否   | 删除的文档数量           |
| requestId | string  | 是   | 请求序列号，用于错误排查 |

#### 4. 示例代码

方式 1. 通过  指定文档 ID 删除

collection.doc(\_id).remove()

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    const res = await db
        .collection('articles')
        .doc('xxx')
        .remove()

    console.log(res.deleted) // 打印删除的文档数量
}
```

方式 2. 条件查找文档然后直接批量删除

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    // 删除字段a的值大于2的文档
    const res = await db
        .collection('articles')
        .where({
            a: _.gt(2)
        })
        .remove()

    console.log(res.deleted) // 打印删除的文档数量
}
```

## update / set

#### 1. 接口描述

接口功能：更新文档

接口声明：

`update(object: <Object>): Promise<Object>`

`set(object: <Object>): Promise<Object>`

备注：update 和 set 都可以用来更新文档，区别是 set 方法在要更新的文档不存在时新增一个文档；而 update 方法什么也不会做，返回 updated 为 0

#### 2. 输入参数

| 字段 | 类型      | 必填 | 说明           |
| ---- | --------- | ---- | -------------- |
| -    | <Object\> | 是   | 替换文档的定义 |

#### 3. 返回结果

| 字段       | 类型    | 必填 | 说明                     |
| ---------- | ------- | ---- | ------------------------ |
| code       | string  | 否   | 状态码，操作成功则不返回 |
| message    | string  | 否   | 错误描述                 |
| updated    | integer | 否   | 影响的文档数量           |
| upsertedId | string  | 否   | 插入的文档的 id          |
| requestId  | string  | 是   | 请求序列号，用于错误排查 |

#### 4. 示例代码

更新指定文档

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    // 更新单文档
    const res = await db
        .collection('articles')
        .doc('doc-id')
        .update({
            name: 'Hey'
        })

    console.log(res.updated) // 打印更新成功的文档数量

    // 批量更新文档
    const res1 = await db
        .collection('articles')
        .where({ name: _.eq('hey') })
        .update({
            age: 18
        })

    console.log(res1.updated) // 打印更新成功的文档数量
}
```

更新文档，如果不存在则创建

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    // 更新单文档
    const res = await db
        .collection('articles')
        .doc('doc-id')
        .set({
            name: 'Hey'
        })
    console.log(res.upsertedId) // 打印插入的文档的id
}
```

## GEO 地理位置

注意：**如果需要对类型为地理位置的字段进行搜索，一定要建立地理位置索引**。

### GEO 数据类型

#### Point

用于表示地理位置点，用经纬度唯一标记一个点，这是一个特殊的数据存储类型。

签名：`Point(longitude: number, latitude: number)`

示例：

```js
new db.Geo.Point(longitude, latitude)
```

#### LineString

用于表示地理路径，是由两个或者更多的 `Point` 组成的线段。

签名：`LineString(points: Point[])`

示例：

```js
new db.Geo.LineString([
    new db.Geo.Point(lngA, latA),
    new db.Geo.Point(lngB, latB)
    // ...
])
```

#### Polygon

用于表示地理上的一个多边形（有洞或无洞均可），它是由一个或多个**闭环** `LineString` 组成的几何图形。

由一个环组成的 `Polygon` 是没有洞的多边形，由多个环组成的是有洞的多边形。对由多个环（`LineString`）组成的多边形（`Polygon`），第一个环是外环，所有其他环是内环（洞）。

签名：`Polygon(lines: LineString[])`

示例：

```js
new db.Geo.Polygon([
  new db.Geo.LineString(...),
  new db.Geo.LineString(...),
  // ...
])
```

#### MultiPoint

用于表示多个点 `Point` 的集合。

签名：`MultiPoint(points: Point[])`

示例：

```js
new db.Geo.MultiPoint([
    new db.Geo.Point(lngA, latA),
    new db.Geo.Point(lngB, latB)
    // ...
])
```

#### MultiLineString

用于表示多个地理路径 `LineString` 的集合。

签名：`MultiLineString(lines: LineString[])`

示例：

```js
new db.Geo.MultiLineString([
  new db.Geo.LineString(...),
  new db.Geo.LineString(...),
  // ...
])
```

#### MultiPolygon

用于表示多个地理多边形 `Polygon` 的集合。

签名：`MultiPolygon(polygons: Polygon[])`

示例：

```js
new db.Geo.MultiPolygon([
  new db.Geo.Polygon(...),
  new db.Geo.Polygon(...),
  // ...
])
```

### GEO 操作符

#### geoNear

按从近到远的顺序，找出字段值在给定点的附近的文档。

签名：

```js
db.command.geoNear(options: IOptions)

interface IOptions {
  geometry: Point // 点的地理位置
  maxDistance?: number // 选填，最大距离，米为单位
  minDistance?: number // 选填，最小距离，米为单位
}
```

示例：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    const res = await db
        .collection('user')
        .where({
            location: db.command.geoNear({
                geometry: new db.Geo.Point(lngA, latA),
                maxDistance: 1000,
                minDistance: 0
            })
        })
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

#### geoWithin

找出字段值在指定 Polygon / MultiPolygon 内的文档，无排序

签名：

```js
db.command.geoWithin(IOptions)

interface IOptions {
    geometry: Polygon | MultiPolygon; // 地理位置
}
```

示例：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    // 一个闭合的区域
    const area = new Polygon([
        new LineString([
            new Point(lngA, latA),
            new Point(lngB, latB),
            new Point(lngC, latC),
            new Point(lngA, latA)
        ])
    ])

    // 搜索 location 字段在这个区域中的 user
    const res = await db
        .collection('user')
        .where({
            location: db.command.geoWithin({
                geometry: area
            })
        })
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

#### geoIntersects

找出字段值和给定的地理位置图形相交的文档

签名：

```js
db.command.geoIntersects(IOptions)

interface IOptions {
    geometry: Point | LineString | MultiPoint | MultiLineString | Polygon | MultiPolygon; // 地理位置
}
```

示例：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()
const _ = db.command

exports.main = async (event, context) => {
    // 一条路径
    const line = new LineString([new Point(lngA, latA), new Point(lngB, latB)])

    // 搜索 location 与这条路径相交的 user
    const res = await db
        .collection('user')
        .where({
            location: db.command.geoIntersects({
                geometry: line
            })
        })
        .get()
    console.log(res.data) // 打印查询的文档数组
}
```

## 时间 Date

Date 类型用于表示时间，精确到毫秒，可以用 JavaScript 内置 Date 对象创建。需要特别注意的是，用此方法创建的时间是客户端时间，不是服务端时间。如果需要使用服务端时间，应该用 API 中提供的 serverDate 对象来创建一个服务端当前时间的标记，当使用了 serverDate 对象的请求抵达服务端处理时，该字段会被转换成服务端当前的时间，更棒的是，我们在构造 serverDate 对象时还可通过传入一个有 offset 字段的对象来标记一个与当前服务端时间偏移 offset 毫秒的时间，这样我们就可以达到比如如下效果：指定一个字段为服务端时间往后一个小时。

那么当我们需要使用客户端时间时，存放 Date 对象和存放毫秒数是否是一样的效果呢？不是的，我们的数据库有针对日期类型的优化，建议大家使用时都用 Date 或 serverDate 构造时间对象。

```js
//服务端当前时间
new db.serverDate()
```

```js
//服务端当前时间加1S
new db.serverDate({
    offset: 1000
})
```

## 数据库事务

### startTransaction

#### 1. 接口描述

接口功能：发起事务

接口声明：`startTransaction(): Promise<Object>`

#### 2. 输入参数

无

#### 3. 返回结果

| 参数    | 类型   | 必填 | 说明                     |
| ------- | ------ | ---- | ------------------------ |
| \_id    | string | 否   | 成功则返回事务 id        |
| code    | string | 否   | 状态码，操作成功则不返回 |
| message | string | 否   | 错误描述                 |

#### 4. 示例代码

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    const transaction = await db.startTransaction()
    console.log(transaction._id) // 打印事务id
}
```

### commit

#### 1. 接口描述

接口功能：提交事务

接口声明：`commit(): Promise<Object>`

#### 2. 输入参数

无

#### 3. 返回结果

| 字段      | 类型   | 必填 | 说明                        |
| --------- | ------ | ---- | --------------------------- |
| requestId | string | 是   | 请求 id                     |
| code      | string | 否   | 状态码，操作成功则不返回    |
| message   | string | 否   | 错误描述， 操作成功则不返回 |

#### 4. 示例代码

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    const transaction = await db.startTransaction()
    await transaction.commit()
}
```

### get

#### 1. 接口描述

接口功能：事务查询文档

接口声明：`get(): Promise<Object>`

#### 2. 输入参数

无

#### 3. 返回结果

| 参数      | 类型                 | 必填 | 说明                        |
| --------- | -------------------- | ---- | --------------------------- |
| data      | &lt;Array&gt;.Object | 否   | 操作成功，返回文档对象数组  |
| requestId | string               | 是   | 请求 id                     |
| code      | string               | 否   | 状态码，操作成功则不返回    |
| message   | string               | 否   | 错误描述， 操作成功则不返回 |

#### 4. 示例代码

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    /**
     * 事务操作支持两种写法，写法一如下，1. 调用startTransaction发起事务 2. 事务操作 3.调用commitTransactio提交事务
     *
     *
     */
    const transaction = await db.startTransaction()
    const doc = await transaction
        .collection(collectionName)
        .doc('docId')
        .get()
    console.log(doc.data) // 打印查询的文档
    await transaction.commit()

    /**
     * 写法二，runTransaction(callback(transaction)), 支持用户传入回调，回调参数为transaction
     *
     *
     */
    await db.runTransaction(async function(transaction) {
        const doc = await transaction
            .collection(collectionName)
            .doc('docId')
            .get()
        console.log(doc.data) // 打印查询的文档
    })
}
```

### add

#### 1. 接口描述

接口功能：事务插入文档

接口声明：`add(data): Promise<Object>`

#### 2. 输入参数

| 参数 | 类型   | 必填 | 说明                                          |
| ---- | ------ | ---- | --------------------------------------------- |
| -    | Object | 是   | 例 {\_id: '10001', 'name': 'Ben'} \_id 非必填 |

#### 3. 返回结果

| 参数      | 类型   | 必填 | 说明                        |
| --------- | ------ | ---- | --------------------------- |
| requestId | string | 是   | 请求 id                     |
| code      | string | 否   | 状态码，操作成功则不返回    |
| message   | string | 否   | 错误描述， 操作成功则不返回 |
| id        | string | 否   | 插入数据的 docId            |
| inserted  | number | 否   | 插入成功的条数              |
| ok        | number | 否   | 插入状态 1 表示成功         |

#### 4. 示例代码

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    // 云函数环境下，下面代码放置入口函数体内
    const transaction = await db.startTransaction()
    const res = await transaction
        .collection(collectionName)
        .add({ category: 'Web', tags: ['JavaScript', 'C#'], date })
    console.log(res.id) // 打印添加的docId
    await transaction.commit()
}
```

### update / set

#### 1. 接口描述

接口功能：事务更新文档

接口声明：

`update(data): Promise<Object>`

`set(object: Object): Promise<Object>`

备注：update 和 set 都可以用来更新文档，区别是 set 方法在要更新的文档不存在时新增一个文档；而 update 方法什么也不会做，返回 updated 为 0

#### 2. 输入参数

| 参数 | 类型   | 必填 | 说明             |
| ---- | ------ | ---- | ---------------- |
| -    | Object | 是   | 要更新的字段对象 |

#### 3. 返回结果

| 参数      | 类型   | 必填 | 说明                        |
| --------- | ------ | ---- | --------------------------- |
| updated   | number | 否   | 更新成功的条数              |
| upserted  | number | 否   | 插入成功的条数              |
| requestId | string | 是   | 请求 id                     |
| code      | string | 否   | 状态码，操作成功则不返回    |
| message   | string | 否   | 错误描述， 操作成功则不返回 |

#### 4. 示例代码

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    const transaction = await db.startTransaction()
    // update
    const updateResult = await transaction
        .collection(collectionName)
        .doc('docId')
        .update({
            category: 'Node.js',
            date
        })

    console.log(updateResult.updated) // 更新的条数

    // set
    const setResult = await transaction
        .collection(collectionName)
        .doc('docId')
        .set({
            category: 'Node.js',
            date
        })

    console.log(setResult.updated, setResult.upserted)
    await transaction.commit()
}
```

### delete

#### 1. 接口描述

接口功能：事务删除文档

接口声明：`delete(): Promise<Object>`

#### 2. 输入参数

无

#### 3. 返回结果

| 字段      | 类型   | 必填 | 说明                        |
| --------- | ------ | ---- | --------------------------- |
| deleted   | number | 否   | 删除成功的条数              |
| requestId | string | 是   | 请求 id                     |
| code      | string | 否   | 状态码，操作成功则不返回    |
| message   | string | 否   | 错误描述， 操作成功则不返回 |

#### 4. 示例代码

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    // deletaDocument
    const transaction = await db.startTransaction()
    const deleteResult = await transaction
        .collection(collectionName)
        .doc('docId')
        .delete()
    console.log(deleteResult.deleted) // 删除成功的条数
    await transaction.commit()
}
```

### rollback

#### 1. 接口描述

接口功能：事务回滚

接口声明：`rollback(): Promise<Object>`

#### 2. 输入参数

无

#### 3. 返回结果

| 字段      | 类型   | 必填 | 说明    |
| --------- | ------ | ---- | ------- |
| requestId | string | 是   | 请求 id |

#### 4. 示例代码

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    // 云函数环境下，下面代码放置入口函数体内
    const transaction = await db.startTransaction()
    const doc = await transaction
        .collection(collectionName)
        .doc('docId')
        .get()
    console.log(doc.data)
    await transaction.rollback()
    await transaction.commit()
}
```

### runTransaction 使用说明

1. 支持自定义返回 (正常 return 或 throw error)

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    const result = await db.runTransaction(async function(transaction) {
        const doc = await transaction
            .collection(collectionName)
            .doc('1')
            .get()
        console.log(doc.data)
        return 'luke'
    })
}

// result === 'luke'
```

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    try {
        await db.runTransaction(async transaction => {
            const doc = await transaction
                .collection(collectionName)
                .doc('1')
                .get()
            console.log(doc.data)
            // mock 事务冲突
            throw {
                code: 'DATABASE_TRANSACTION_CONFLICT',
                message:
                    '[ResourceUnavailable.TransactionConflict] Transaction is conflict, maybe resource operated by others. Please check your request, but if the problem persists, contact us.'
            }
        })
    } catch (e) {
        // e.code === 'DATABASE_TRANSACTION_CONFLICT'
    }
}
```

2. rollback 使用

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
    env: 'xxx'
})
const db = app.database()

exports.main = async (event, context) => {
    try {
        await db.runTransaction(async function(transaction) {
            const doc = await transaction
                .collection(collectionName)
                .doc('1')
                .get()
            console.log(doc.data)
            await transaction.rollback('luke')
        })
    } catch (err) {
        // err === 'luke'
    }

    try {
        await db.runTransaction(async function(transaction) {
            const doc = await transaction
                .collection(collectionName)
                .doc('1')
                .get()
            console.log(doc.data)
            await transaction.rollback()
        })
    } catch (err) {
        // assert(err.requestId)
        console.log(err.requestId) // 默认rollback返回回滚的requestId
    }
}
```
