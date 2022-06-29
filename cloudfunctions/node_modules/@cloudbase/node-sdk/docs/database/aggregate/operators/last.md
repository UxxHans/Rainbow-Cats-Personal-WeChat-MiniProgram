# db.command.aggregate.last

### 1. 操作符描述

功能：返回指定字段在一组集合的最后一条记录对应的值。仅当这组集合是按照某种定义排序（ `sort` ）后，此操作才有意义。

声明：`db.command.aggregate.last(<表达式>)`

注意事项:

> `last` 只能在 `group` 阶段被使用，并且需要配合 `sort` 才有意义。

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

如果需要得到所有记录中 `score` 的最大值，可以先将所有记录按照 `score` 排序，然后取出最后一条记录的 `last`。

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
    .sort({
      score: 1
    })
    .group({
      _id: null,
      max: $.last('$score')
    })
    .end()
  console.log(res.data)
}
```

返回的数据结果如下：

```json
{ "_id": null, "max": 100 }
```
