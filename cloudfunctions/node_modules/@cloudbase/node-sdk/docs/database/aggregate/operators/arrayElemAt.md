# db.command.aggregate.arrayElemAt

### 1. 操作符描述

功能：返回在指定数组下标的元素。

声明：`db.command.aggregate.arrayElemAt([array, index])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                                                                             |
| ---- | ------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------ |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 第一个元素`array` 可以是任意解析为数组的表达式，第二个元素`index` 可以是任意解析为整形的表达式。 |

注意事项：

> 如果是正数，`arrayElemAt` 返回在 `index` 位置的元素，如果是负数，`arrayElemAt` 返回从数组尾部算起的 `index` 位置的元素。

### 3. 示例代码

假设集合 `exams` 有如下记录：

```json
{ "_id": 1, "scores": [80, 60, 65, 90] }
{ "_id": 2, "scores": [78] }
{ "_id": 3, "scores": [95, 88, 92] }
```

求各个第一次考试的分数和和最后一次的分数：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('exams')
    .aggregate()
    .project({
      first: $.arraElemAt(['$scores', 0]),
      last: $.arraElemAt(['$scores', -1])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "first": 80, "last": 90 }
{ "_id": 2, "first": 78, "last": 78 }
{ "_id": 3, "first": 95, "last": 92 }
```
