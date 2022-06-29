# Aggregate.match

### 1. 接口描述

功能: 聚合阶段。根据条件过滤文档，并且把符合条件的文档传递给下一个流水线阶段。

声明: `match({ <字段名>: <表达式> })`

### 2. 输入参数

| 参数 | 类型                           | 必填 | 说明                                                                                                         |
| ---- | ------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------ |
| key  | [expression](../expression.md) | 是   | key 为任意自定义字段名，其值表达式可以直接使用 `number`、`string` 这样的原生类型，也可以使用聚合搜索操作符： |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

假设集合 `articles` 有如下记录：

```json
{ "_id" : "1", "author" : "stark",  "score" : 80 }
{ "_id" : "2", "author" : "stark",  "score" : 85 }
{ "_id" : "3", "author" : "bob",    "score" : 60 }
{ "_id" : "4", "author" : "li",     "score" : 55 }
{ "_id" : "5", "author" : "jimmy",  "score" : 60 }
{ "_id" : "6", "author" : "li",     "score" : 94 }
{ "_id" : "7", "author" : "justan", "score" : 95 }
```

#### 匹配

下面是一个直接匹配的例子：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('articles')
    .aggregate()
    .match({
      author: 'stark'
    })
    .end()
  console.log(res.data)
}
```

这里的代码尝试找到所有 `author` 字段是 `stark` 的文章，那么匹配如下：

```json
{ "_id" : "1", "author" : "stark", "score" : 80 }
{ "_id" : "2", "author" : "stark", "score" : 85 }
```

#### 计数

`match` 过滤出文档后，还可以与其他流水线阶段配合使用。

比如下面这个例子，我们使用 `group` 进行搭配，计算 `score` 字段大于 `80` 的文档数量：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('articles')
    .aggregate()
    .match({
      score: gt(80)
    })
    .group({
      _id: null,
      count: sum(1)
    })
    .end()
  console.log(res.data)
}
```

返回值如下：

```json
{ "_id": null, "count": 3 }
```
