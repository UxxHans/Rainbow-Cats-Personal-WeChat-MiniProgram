# db.command.aggregate.pow

### 1. 操作符描述

功能：求给定基数的指数次幂。

声明：`db.command.aggregate.pow([base, exponent])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明           |
| ---- | ------------------------------------------- | ---- | -------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组 |

### 3. 示例代码

假设集合 `stats` 有如下记录：

```json
{ "_id": 1, "x": 2, "y": 3 }
{ "_id": 2, "x": 5, "y": 7 }
{ "_id": 3, "x": 10, "y": 20 }
```

求 `x` 和 `y` 的平方和：

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
      sumOfSquares: $.add([$.pow(['$x', 2]), $.pow(['$y', 2])])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "sumOfSquares": 13 }
{ "_id": 2, "sumOfSquares": 74 }
{ "_id": 3, "sumOfSquares": 500 }
```
