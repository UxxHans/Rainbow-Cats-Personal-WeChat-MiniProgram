# db.command.aggregate.log

### 1. 操作符描述

功能：计算给定数字在给定对数底下的 log 值。

声明：`db.command.aggregate.log([number, base])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                                                                          |
| ---- | ------------------------------------------- | ---- | --------------------------------------------------------------------------------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | `<number>` 可以是任意解析为非负数字的表达式。`<base>` 可以是任意解析为大于 1 的数字的表达式。 |

注意事项：

> 如果任一参数解析为 `null` 或指向任意一个不存在的字段，`log` 返回 `null`。如果任一参数解析为 `NaN`，`log` 返回 `NaN`。

### 3. 示例代码

假设集合 `staff` 有如下记录：

```
{ _id: 1, x: 1 }
{ _id: 2, x: 2 }
{ _id: 3, x: 3 }
```

计算 `log2(x)` 的值：

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
    .collection('staff')
    .aggregate()
    .project({
      log: $.log(['$x', 2])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{ _id: 1, log: 0 }
{ _id: 2, log: 1 }
{ _id: 3, log: 1.58496250072 }
```
