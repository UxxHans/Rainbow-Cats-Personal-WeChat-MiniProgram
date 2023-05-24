# db.command.aggregate.second

### 1. 操作符描述

功能：返回日期字段对应的秒数，是一个介于 0 到 59 之间的整数，在特殊情况下（闰秒）可能等于 60。

声明：`db.command.aggregate.second(<日期字段>)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明       |
| ---- | ------------------------------ | ---- | ---------- |
| -    | [Expression](../expression.md) | 是   | 聚合表达式 |

### 3. 示例代码

假设集合 `dates` 有以下文档：

```json
{
  "_id": 1,
  "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `second()` 对 `date` 字段进行投影，获取对应的秒数：

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
    .collection('dates')
    .aggregate()
    .project({
      _id: 0,
      second: $.second('$date')
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{
  "second": 51
}
```
