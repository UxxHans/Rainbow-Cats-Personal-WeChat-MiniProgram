# db.command.aggregate.or

### 1. 操作符描述

功能：给定多个表达式，如果任意一个表达式返回 `true`，则 `or` 返回 `true`，否则返回 `false`。

声明：`db.command.aggregate.or([expression1, expression2, ...])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明           |
| ---- | ------------------------------------------- | ---- | -------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组 |

### 3. 示例代码

假设集合 `price` 有如下记录：

```json
{ "_id": 1, "min": 10, "max": 100 }
{ "_id": 2, "min": 60, "max": 80 }
{ "_id": 3, "min": 30, "max": 50 }
```

求 `min` 小于 40 且 `max` 大于 60 的记录。

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
      fullfilled: $.or([$.lt(['$min', 30]), $.gt(['$max', 60])])
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
