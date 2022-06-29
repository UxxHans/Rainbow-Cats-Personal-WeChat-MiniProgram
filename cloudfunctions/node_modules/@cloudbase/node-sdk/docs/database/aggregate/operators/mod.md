# db.command.aggregate.mod

### 1. 操作符描述

功能：取模运算，取数字取模后的值。

声明：`db.command.aggregate.mod([dividend, divisor])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                                                     |
| ---- | ------------------------------------------- | ---- | ------------------------------------------------------------------------ |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 第一个数字是被除数，第二个数字是除数。参数可以是任意解析为数字的表达式。 |

### 3. 示例代码

假设集合 `shopping` 有如下记录：

```
{ _id: 1, bags: 3, items: 5 }
{ _id: 2, bags: 2, items: 8 }
{ _id: 3, bags: 5, items: 16 }
```

各记录取 `items` 除以 `bags` 的余数（`items % bags`）：

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
    .collection('shopping')
    .aggregate()
    .project({
      overflow: $.mod(['$items', '$bags'])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{ _id: 1, log: 2 }
{ _id: 2, log: 0 }
{ _id: 3, log: 1 }
```
