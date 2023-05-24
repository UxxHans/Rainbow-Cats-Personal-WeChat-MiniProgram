# db.command.aggregate.isArray

### 1. 操作符描述

功能：判断给定表达式是否是数组，返回布尔值。

声明：`db.command.aggregate.isArray(expression)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                       |
| ---- | ------------------------------ | ---- | -------------------------- |
| -    | [Expression](../expression.md) | 是   | 参数可以是任意聚合表达式。 |

### 3. 示例代码

假设集合 `stats` 有如下记录：

```json
{
  "_id": 1,
  "base": 10,
  "sales": [ 1, 6, 2, 2, 5 ]
}
{
  "_id": 2,
  "base": 1,
  "sales": 100
}
```

计算总销量，如果 `sales` 是数字，则求 `sales * base`，如果 `sales` 是数组，则求数组元素之和与 `base` 的乘积。

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
      sum: $.cond({
        if: $.isArray('$sales'),
        then: $.multiply([$.sum(['$sales']), '$base']),
        else: $.multiply(['$sales', '$base'])
      })
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "index": 160 }
{ "_id": 2, "index": 100 }
```
