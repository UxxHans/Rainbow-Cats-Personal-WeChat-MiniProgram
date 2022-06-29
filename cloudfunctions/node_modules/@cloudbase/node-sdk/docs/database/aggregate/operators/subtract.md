# db.command.aggregate.subtract

### 1. 操作符描述

功能：将两个数字相减然后返回差值，或将两个日期相减然后返回相差的毫秒数，或将一个日期减去一个数字返回结果的日期。

声明：``db.command.aggregate.subtract([expression1, expression2])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                                     |
| ---- | ------------------------------------------- | ---- | -------------------------------------------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组，参数可以是任意解析为数字或日期的表达式。 |

### 3. 示例代码

假设集合 `scores` 有如下记录：

```json
{ "_id": 1, "max": 10, "min": 1 }
{ "_id": 2, "max": 7, "min": 5 }
{ "_id": 3, "max": 6, "min": 6 }
```

求各个记录的 `max` 和 `min` 的差值。：

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
    .collection('scores')
    .aggregate()
    .project({
      diff: $.subtract(['$max', '$min'])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "diff": 9 }
{ "_id": 2, "diff": 2 }
{ "_id": 3, "diff": 0 }
```
