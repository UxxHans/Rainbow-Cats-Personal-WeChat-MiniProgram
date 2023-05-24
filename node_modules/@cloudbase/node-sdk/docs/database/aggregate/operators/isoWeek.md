# db.command.aggregate.isoWeek

### 1. 操作符描述

功能：返回日期字段对应的 ISO 8601 标准的周数（一年中的第几周），是一个介于 1 到 53 之间的整数。

声明：`db.command.aggregate.isoWeek(<日期字段>)`

例如：2016 年 1 月 7 日是那年的第一个周四，那么 2016.01.04（周一）到 2016.01.10（周日） 即为第 1 周。同理，2016 年 1 月 1 日的周数为 53。

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明         |
| ---- | ------------------------------ | ---- | ------------ |
| -    | [Expression](../expression.md) | 是   | 聚合表达式。 |

### 3. 示例代码

假设集合 `dates` 有以下文档：

```json
{
  "_id": 1,
  "date": ISODate("2019-05-14T09:38:51.686Z")
}
```

我们使用 `isoWeek()` 对 `date` 字段进行投影，获取对应的 ISO 8601 标准的周数（一年中的第几周）：

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
      isoWeek: $.isoWeek('$date')
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{
  "isoWeek": 20
}
```
