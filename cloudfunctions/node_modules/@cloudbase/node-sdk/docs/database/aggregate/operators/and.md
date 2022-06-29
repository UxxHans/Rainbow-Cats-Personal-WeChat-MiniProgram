# db.command.aggregate.and

### 1. 操作符描述

功能：给定多个表达式，`and` 仅在所有表达式都返回 `true` 时返回 `true`，否则返回 `false`。

声明：`db.command.aggregate.and([expression1, expression2, ...])`

注意事项:

> 如果表达式返回 `false`、`null`、`0`、或 `undefined`，表达式会解析为 `false`，否则对其他返回值都认为是 `true`。

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明       |
| ---- | ------------------------------------------- | ---- | ---------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式 |

### 3. 示例代码

假设集合 `price` 有如下记录：

```json
{ "_id": 1, "min": 10, "max": 100 }
{ "_id": 2, "min": 60, "max": 80 }
{ "_id": 3, "min": 30, "max": 50 }
```

求 `min` 大于等于 30 且 `max` 小于等于 80 的记录。

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('price')
    .aggregate()
    .project({
      fullfilled: $.and([$.gte(['$min', 30]), $.lte(['$max', 80])])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "fullfilled": false }
{ "_id": 2, "fullfilled": true }
{ "_id": 3, "fullfilled": true }
```
