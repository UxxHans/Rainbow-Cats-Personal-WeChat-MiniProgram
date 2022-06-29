# db.command.aggregate.avg

### 1. 操作符描述

功能：返回一组集合中，指定字段对应数据的平均值。

声明：`db.command.aggregate.avg(expression)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                                                                     |
| ---- | ------------------------------ | ---- | ---------------------------------------------------------------------------------------- |
| -    | [Expression](../expression.md) | 是   | `avg` 传入的值除了数字常量外，也可以是任何最终解析成一个数字的表达式。它会忽略非数字值。 |

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "group": "a", "name": "stu1", "score": 84 }
{ "group": "a", "name": "stu2", "score": 96 }
{ "group": "b", "name": "stu3", "score": 80 }
{ "group": "b", "name": "stu4", "score": 100 }
```

借助 `avg` 可以计算所有记录的 `score` 的平均值：

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
      _id: null,
      average: $.avg('$score')
    })
    .end()
  console.log(res.data)
}
```

返回的结果如下：

```json
{ "_id": null, "average": 90 }
```
