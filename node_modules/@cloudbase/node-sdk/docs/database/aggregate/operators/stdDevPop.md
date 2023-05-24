# db.command.aggregate.stdDevPop

### 1. 操作符描述

功能：返回一组字段对应值的标准差。

声明：``db.command.aggregate.stdDevPop(<表达式>)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                                                                        |
| ---- | ------------------------------ | ---- | ------------------------------------------------------------------------------------------- |
| -    | [Expression](../expression.md) | 是   | 表达式传入的是指定字段，指定字段对应的值的数据类型必须是 `number` ，否则结果会返回 `null`。 |

### 3. 示例代码

假设集合 `students` 的记录如下：`a` 组同学的成绩分别是 84 和 96，`b`组同学的成绩分别是 80 和 100。

```
{ "group":"a", "score":84 }
{ "group":"a", "score":96 }
{ "group":"b", "score":80 }
{ "group":"b", "score":100 }
```

可以用 `stdDevPop` 来分别计算 `a` 和 `b` 两组同学成绩的标准差，以此来比较哪一组同学的成绩更稳定。代码如下：

```javascript
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
    .collection('students')
    .aggregate()
    .group({
      _id: '$group',
      stdDev: $.stdDevPop('$score')
    })
    .end()
  console.log(res.data)
}
```

返回的数据结果如下：

```
{ "_id": "b", "stdDev": 10 }
{ "_id": "a", "stdDev": 6 }
```
