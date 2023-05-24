# db.command.aggregate.multiply

### 1. 操作符描述

功能：取传入的数字参数相乘的结果。

声明：`db.command.aggregate.multiply([expression1, expression2, ...])`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                               |
| ---- | ------------------------------ | ---- | ---------------------------------- |
| -    | [Expression](../expression.md) | 是   | 参数可以是任意解析为数字的表达式。 |

### 3. 示例代码

假设集合 `fruits` 有如下记录：

```json
{ "_id": 1, "name": "apple", "price": 10, "quantity": 100 }
{ "_id": 2, "name": "orange", "price": 15, "quantity": 50 }
{ "_id": 3, "name": "lemon", "price": 5, "quantity": 20 }
```

求各个水果的的总价值：

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
    .collection('fruits')
    .aggregate()
    .project({
      name: 1,
      total: $.multiply(['$price', '$quantity'])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "name": "apple", "total": 1000 }
{ "_id": 2, "name": "orange", "total": 750 }
{ "_id": 3, "name": "lemo", "total": 100 }
```
