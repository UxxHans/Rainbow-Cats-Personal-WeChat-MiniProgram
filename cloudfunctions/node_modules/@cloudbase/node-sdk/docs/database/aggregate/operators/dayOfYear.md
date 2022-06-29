# db.command.aggregate.dayOfYear

### 1. 操作符描述

功能：返回日期字段对应的天数（一年中的第几天），是一个介于 1 到 366 之间的整数。

声明：`db.command.aggregate.dayOfYear(<日期字段>)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明     |
| ---- | ------------------------------ | ---- | -------- |
| -    | [Expression](../expression.md) | 是   | 日期字段 |

### 3. 示例代码

假设集合 `dates` 有以下文档：

```json
{
  "_id": 1,
  "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `dayOfYear()` 对 `date` 字段进行投影，获取对应的天数（一年中的第几天）：

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('dates')
    .aggregate()
    .project({
      _id: 0,
      dayOfYear: $.dayOfYear('$date')
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{
  "dayOfYear": 134
}
```
