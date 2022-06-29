# db.command.aggregate.ln

### 1. 操作符描述

功能：计算给定数字在自然对数值。

声明：`db.command.aggregate.ln(number)`

注意事项:

> `ln` 等价于 `log([<number>, Math.E])`，其中 `Math.E` 是 `JavaScript` 获取 `e` 的值的方法。

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                          |
| ---- | ------------------------------ | ---- | --------------------------------------------- |
| -    | [Expression](../expression.md) | 是   | `<number>` 可以是任意解析为非负数字的表达式。 |

### 3. 示例代码

假设集合 `staff` 有如下记录：

```
{ _id: 1, x: 1 }
{ _id: 2, x: 2 }
{ _id: 3, x: 3 }
```

计算 `ln(x)` 的值：

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
    .collection('ratings')
    .aggregate()
    .project({
      ln: $.ln('$x')
    })
    .end()
  console.log(res.data)
}
```
