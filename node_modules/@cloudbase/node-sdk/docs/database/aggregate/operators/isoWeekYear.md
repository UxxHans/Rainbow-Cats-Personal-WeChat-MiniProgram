# db.command.aggregate.isoWeekYear

### 1. 操作符描述

功能：返回日期字段对应的 ISO 8601 标准的天数（一年中的第几天）。

声明：`db.command.aggregate.isoWeekYear(<日期字段>)`

注意事项:

> 此处的“年”以第一周的周一为开始，以最后一周的周日为结束。

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

我们使用 `isoWeekYear()` 对 `date` 字段进行投影，获取对应的 ISO 8601 标准的天数（一年中的第几天）：

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
      isoWeekYear: $.isoWeekYear('$date')
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{
  "isoWeekYear": 2019
}
```
