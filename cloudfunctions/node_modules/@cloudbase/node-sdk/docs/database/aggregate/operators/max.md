# db.command.aggregate.max

### 1. 操作符描述

功能：返回一组数值的最大值。

声明：`db.command.aggregate.max(<表达式>)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                   |
| ---- | ------------------------------ | ---- | -------------------------------------- |
| -    | [Expression](../expression.md) | 是   | 表达式是形如 `$ + 指定字段` 的字符串。 |

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

借助 `max` 可以统计不同组（ `group` ）中成绩的最高值，代码如下：

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
    .collection('students')
    .aggregate()
    .group({
      _id: '$group',
      maxScore: $.max('$score')
    })
    .end()
  console.log(res.data)
}
```

返回的数据结果如下：

```json
{ "_id": "b", "maxScore": 100 }
{ "_id": "a", "maxScore": 96 }
```
