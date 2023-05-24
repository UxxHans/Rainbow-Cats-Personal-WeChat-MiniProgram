# db.command.aggregate.mergeObjects

### 1. 操作符描述

功能：将多个文档合并为单个文档。

声明：`db.command.aggregate.max(<表达式>)`

表达式有两种使用形式如下：

- 在 `group()` 中使用时：

```
mergeObjects(<document>)
```

- 在其它表达式中使用时：

```
mergeObjects([<document1>, <document2>, ...])
```

### 2. 操作符参数

| 字段 | 类型                                                                          | 必填 | 说明       |
| ---- | ----------------------------------------------------------------------------- | ---- | ---------- |
| -    | [Expression](../expression.md) or &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式 |

### 3. 示例代码

#### 搭配 `group()` 使用

假设集合 `sales` 存在以下文档：

```json
{ "_id": 1, "year": 2018, "name": "A", "volume": { "2018Q1": 500, "2018Q2": 500 } }
{ "_id": 2, "year": 2017, "name": "A", "volume": { "2017Q1": 400, "2017Q2": 300, "2017Q3": 0, "2017Q4": 0 } }
{ "_id": 3, "year": 2018, "name": "B", "volume": { "2018Q1": 100 } }
{ "_id": 4, "year": 2017, "name": "B", "volume": { "2017Q3": 100, "2017Q4": 250 } }
```

下面的代码使用 `mergeObjects()`，将用相同 `name` 的文档合并：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('sales')
    .aggregate()
    .group({
      _id: '$name',
      mergedVolume: $.mergeObjects('$volume')
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "_id": "A", "mergedVolume": { "2017Q1": 400, "2017Q2": 300, "2017Q3": 0, "2017Q4": 0, "2018Q1": 500, "2018Q2": 500 } }
{ "_id": "B", "mergedVolume": { "2017Q3": 100, "2017Q4": 250, "2018Q1": 100 } }
```

#### 一般用法

假设集合 `test` 存在以下文档：

```json
{ "_id": 1, "foo": { "a": 1 }, "bar": { "b": 2 } }
{ "_id": 2, "foo": { "c": 1 }, "bar": { "d": 2 } }
{ "_id": 3, "foo": { "e": 1 }, "bar": { "f": 2 } }
```

下面的代码使用 `mergeObjects()`，将文档中的 `foo` 和 `bar` 字段合并为 `foobar`：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('sales')
    .aggregate()
    .project({
      foobar: $.mergeObjects(['$foo', '$bar'])
    })
    .end()
  console.log(res.data)
}
```

输出结果如下：

```json
{ "_id": 1, "foobar": { "a": 1, "b": 2 } }
{ "_id": 2, "foobar": { "c": 1, "d": 2 } }
{ "_id": 3, "foobar": { "e": 1, "f": 2 } }
```
