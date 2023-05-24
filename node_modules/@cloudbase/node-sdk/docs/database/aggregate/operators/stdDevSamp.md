# db.command.aggregate.stdDevSamp

### 1. 操作符描述

功能：计算输入值的样本标准偏差。如果输入值代表数据总体，或者不概括更多的数据，请改用 `db.command.aggregate.stdDevPop`。

声明：``db.command.aggregate.stdDevSamp(<表达式>)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                                                                                           |
| ---- | ------------------------------ | ---- | -------------------------------------------------------------------------------------------------------------- |
| -    | [Expression](../expression.md) | 是   | 表达式传入的是指定字段，`stdDevSamp` 会自动忽略非数字值。如果指定字段所有的值均是非数字，那么结果返回 `null`。 |

### 3. 示例代码

假设集合 `students` 的记录如下：

```
{ "score": 80 }
{ "score": 100 }
```

可以用 `stdDevSamp` 来计算成绩的标准样本偏差。代码如下：

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
      _id: null,
      ageStdDev: $.stdDevSamp('$score')
    })
    .end()
  console.log(res.data)
}
```

返回的数据结果如下：

```
{ "_id": null, "ageStdDev": 14.142135623730951 }
```

如果向集合 `students` 添加一条新记录，它的 `score` 字段类型是 `string`：

```
{ "score": "aa" }
```

用上面代码计算标准样本偏差时，`stdDevSamp` 会自动忽略类型不为 `number` 的记录，返回结果保持不变。
