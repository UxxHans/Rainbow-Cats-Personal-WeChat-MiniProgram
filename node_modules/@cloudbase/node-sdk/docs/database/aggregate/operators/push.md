# db.command.aggregate.push

### 1. 操作符描述

功能：在 `group` 阶段，返回一组中表达式指定列与对应的值，一起组成的数组。

声明：`db.command.aggregate.push({ <字段名1>: <指定字段1>, <字段名2>: <指定字段2>, ... })`

### 2. 操作符参数

| 字段 | 类型   | 必填 | 说明                     |
| ---- | ------ | ---- | ------------------------ |
| -    | Object | 是   | 对象键值为任意聚合表达式 |

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

借助 `push` 操作，对不同分组( `group` )的所有记录，聚合所有数据并且将其放入一个新的字段中，进一步结构化和语义化数据。

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
      students: $.push({
        name: '$name',
        score: '$score'
      })
    })
    .end()
  console.log(res.data)
}
```

输出结果如下：

```json
{ "_id": "b", "students": [{ "name": "stu3", "score": 80 }, { "name": "stu4", "score": 100 }] }
{ "_id": "a", "students": [{ "name": "stu1", "score": 84 }, { "name": "stu2", "score": 96 }] }
```
