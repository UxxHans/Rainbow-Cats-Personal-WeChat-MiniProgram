# db.command.aggregate.gte

### 1. 操作符描述

功能：匹配两个值，如果前者大于或等于后者则返回 `true`，否则返回 `false`。

声明：`db.command.aggregate.gte([value1, value2])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明           |
| ---- | ------------------------------------------- | ---- | -------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组 |

### 3. 示例代码

假设集合 `price` 有如下记录：

```json
{ "_id": 1, "value": 10 }
{ "_id": 2, "value": 80 }
{ "_id": 3, "value": 50 }
```

判断 `value` 是否大于或等于 50。

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
      matched: $.gte(['$value', 50])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "matched": false }
{ "_id": 2, "matched": true }
{ "_id": 3, "matched": true }
```
