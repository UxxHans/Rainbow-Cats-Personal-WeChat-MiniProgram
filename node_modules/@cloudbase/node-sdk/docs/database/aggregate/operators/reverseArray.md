# db.command.aggregate.reverseArray

### 1. 操作符描述

功能：返回给定数组的倒序形式。

声明：`db.command.aggregate.reverseArray(array)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                             |
| ---- | ------------------------------ | ---- | -------------------------------- |
| -    | [Expression](../expression.md) | 是   | 参数可以是任意解析为数组表达式。 |

### 3. 示例代码

假设集合 `stats` 有如下记录：

```json
{
  "_id": 1,
  "sales": [1, 2, 3, 4, 5]
}
```

取 `sales` 倒序：

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
    .collection('stats')
    .aggregate()
    .project({
      reversed: $.reverseArray('$sales')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "reversed": [5, 4, 3, 2, 1] }
```
