# db.command.aggregate.not

### 1. 操作符描述

功能：给定一个表达式，如果表达式返回 `true`，则 `not` 返回 `false`，否则返回 `true`。

声明：`db.command.aggregate.not(expression)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                                                                                           |
| ---- | ------------------------------ | ---- | -------------------------------------------------------------------------------------------------------------- |
| -    | [Expression](../expression.md) | 是   | 如果表达式返回 `false`、`null`、`0`、或 `undefined`，表达式会解析为 `false`，否则对其他返回值都认为是 `true`。 |

### 3. 示例代码

假设集合 `price` 有如下记录：

```json
{ "_id": 1, "min": 10, "max": 100 }
{ "_id": 2, "min": 60, "max": 80 }
{ "_id": 3, "min": 30, "max": 50 }
```

求 `min` 不大于 40 的记录。

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
    .collection('price')
    .aggregate()
    .project({
      fullfilled: $.not($.gt(['$min', 40]))
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "fullfilled": true }
{ "_id": 2, "fullfilled": false }
{ "_id": 3, "fullfilled": true }
```
