# db.command.aggregate.in

### 1. 操作符描述

功能：给定一个值和一个数组，如果值在数组中则返回 `true`，否则返回 `false`。

声明：`db.command.aggregate.in([value, array])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                       |
| ---- | ------------------------------------------- | ---- | ------------------------------------------ |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组，`value` 可以是任意表达式， |

`array` 可以是任意解析为数组的表达式。 |

### 3. 示例代码

假设集合 `shops` 有如下记录：

```json
{ "_id": 1, "topsellers": ["bread", "ice cream", "butter"] }
{ "_id": 2, "topsellers": ["ice cream", "cheese", "yagurt"] }
{ "_id": 3, "topsellers": ["croissant", "cucumber", "coconut"] }
```

标记销量最高的商品包含 `ice cream` 的记录。

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
      included: $.in('ice cream', '$topsellers')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "included": true }
{ "_id": 2, "included": true }
{ "_id": 3, "included": false }
```
