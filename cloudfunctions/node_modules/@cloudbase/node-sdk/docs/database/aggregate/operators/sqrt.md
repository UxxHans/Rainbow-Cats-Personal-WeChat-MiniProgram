# db.command.aggregate.sqrt

### 1. 操作符描述

功能：求平方根。

声明：``db.command.aggregate.sqrt([number])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                   |
| ---- | ------------------------------------------- | ---- | -------------------------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 参数可以是任意解析为非负数字的表达式。 |

### 3. 示例代码

假设直角三角形集合 `triangle` 有如下记录：

```json
{ "_id": 1, "x": 2, "y": 3 }
{ "_id": 2, "x": 5, "y": 7 }
{ "_id": 3, "x": 10, "y": 20 }
```

假设 `x` 和 `y` 分别为两直角边，则求斜边长：

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
    .collection('triangle')
    .aggregate()
    .project({
      len: $.sqrt([$.add([$.pow(['$x', 2]), $.pow(['$y', 2])])])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "len": 3.605551275463989 }
{ "_id": 2, "len": 8.602325267042627 }
{ "_id": 3, "len": 22.360679774997898 }
```
