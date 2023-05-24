# db.command.aggregate.dateFromParts

### 1. 操作符描述

功能：给定日期的相关信息，构建并返回一个日期对象。

声明：`db.command.aggregate.dateFromParts(object)`

### 2. 操作符参数

| 字段         | 类型   | 必填 | 说明         |
| ------------ | ------ | ---- | ------------ |
| year         | number | 否   | 年           |
| month        | number | 否   | 月           |
| day          | number | 否   | 日           |
| hour         | number | 否   | 小时         |
| minute       | number | 否   | 分钟         |
| second       | number | 否   | 秒           |
| millisecond  | number | 否   | 毫秒         |
| timezone     | string | 否   | 时区         |
| isoWeekYear  | number | 否   | isoWeekYear  |
| isoWeek      | number | 否   | isoWeek      |
| isoDayOfWeek | number | 否   | isoDayOfWeek |

语法如下：

```
db.command.aggregate.dateFromParts({
    year: <year>,
    month: <month>,
    day: <day>,
    hour: <hour>,
    minute: <minute>,
    second: <second>,
    millisecond: <ms>,
    timezone: <tzExpression>
})
```

你也可以使用 ISO 8601 的标准：

```
db.command.aggregate.dateFromParts({
    isoWeekYear: <year>,
    isoWeek: <week>,
    isoDayOfWeek: <day>,
    hour: <hour>,
    minute: <minute>,
    second: <second>,
    millisecond: <ms>,
    timezone: <tzExpression>
})
```

### 3. 示例代码

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
      date: $.dateFromParts({
        year: 2017,
        month: 2,
        day: 8,
        hour: 12,
        timezone: 'America/New_York'
      })
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{
  "date": ISODate("2017-02-08T17:00:00.000Z")
}
```
