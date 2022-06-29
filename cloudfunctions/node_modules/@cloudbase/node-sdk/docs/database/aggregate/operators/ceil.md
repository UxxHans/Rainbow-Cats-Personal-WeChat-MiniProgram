# db.command.aggregate.ceil

### 1. 操作符描述

功能：向上取整，返回大于或等于给定数字的最小整数。

声明：`db.command.aggregate.ceil(expression)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                                                                                                          |
| ---- | ------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| -    | [Expression](../expression.md) | 是   | 可以是任意解析为数字的表达式。如果表达式解析为 `null` 或指向一个不存在的字段，则返回 `null`，如果解析为 `NaN`，则返回 `NaN`。 |

### 3. 示例代码

假设集合 `sales` 有如下记录：

```
{ _id: 1, sales: 5.2 }
{ _id: 2, sales: 1.32 }
{ _id: 3, sales: -3.2 }
```

可以用如下方式取各个数字的向上取整值：

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
    .collection('sales')
    .aggregate()
    .project({
      sales: $.ceil('$sales')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{ _id: 1, sales: 6 }
{ _id: 2, sales: 2 }
{ _id: 3, sales: -3 }
```
