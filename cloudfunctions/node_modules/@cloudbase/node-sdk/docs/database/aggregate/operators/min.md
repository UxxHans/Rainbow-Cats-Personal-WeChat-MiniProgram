# db.command.aggregate.min

### 1. 操作符描述

功能：返回一组数值的最小值。

声明：`db.command.aggregate.min(<表达式>)`

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

借助 `min` 可以统计不同组（ `group` ）中成绩的最低值，代码如下：

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
      minScore: $.min('$score')
    })
    .end()
  console.log(res.data)
}
```

返回的数据结果如下：

```json
{ "_id": "b", "minScore": 80 }
{ "_id": "a", "minScore": 84 }
```
