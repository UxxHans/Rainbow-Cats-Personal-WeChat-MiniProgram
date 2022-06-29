# db.command.aggregate.dateFromString

### 1. 操作符描述

功能：将一个日期/时间字符串转换为日期对象

声明：`db.command.aggregate.dateFromString({dateString,timezone})`

### 2. 操作符参数

| 字段       | 类型   | 必填 | 说明       |
| ---------- | ------ | ---- | ---------- |
| dateString | string | 是   | 日期字符串 |
| timezone   | string | 否   | 时区       |

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
      date: $.dateFromString({
        dateString: '2019-05-14T09:38:51.686Z'
      })
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{
  "date": ISODate("2019-05-14T09:38:51.686Z")
}
```
