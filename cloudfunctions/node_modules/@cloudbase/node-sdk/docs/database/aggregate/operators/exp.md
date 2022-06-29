# db.command.aggregate.exp

### 1. 操作符描述

功能：取 e（自然对数的底数，欧拉数） 的 n 次方。

声明：`db.command.aggregate.exp(exponent)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                                                                                                                     |
| ---- | ------------------------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| -    | [Expression](../expression.md) | 是   | `exponent` 可以是任意解析为数字的表达式。如果表达式解析为 `null` 或指向一个不存在的字段，则返回 `null`，如果解析为 `NaN`，则返回 `NaN`。 |

### 3. 示例代码

假设集合 `math` 有如下记录：

```
{ _id: 1, exp: 0 }
{ _id: 2, exp: 1 }
{ _id: 3, exp: 2 }
```

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
    .collection('math')
    .aggregate()
    .project({
      result: $.exp('$exp')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{ _id: 1, result: 1 }
{ _id: 2, result: 2.71828182845905 }
{ _id: 3, result: 7.38905609893065 }
```
