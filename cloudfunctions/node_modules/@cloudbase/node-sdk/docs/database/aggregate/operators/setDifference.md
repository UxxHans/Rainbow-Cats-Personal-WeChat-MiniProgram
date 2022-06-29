# db.command.aggregate.setDifference

### 1. 操作符描述

功能：输入两个集合，输出只存在于第一个集合中的元素。

声明：`setDifference([expression1, expression2])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明           |
| ---- | ------------------------------------------- | ---- | -------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组 |

### 3. 示例代码

假设集合 `test` 存在以下数据：

```json
{ "_id": 1, "A": [ 1, 2 ], "B": [ 1, 2 ] }
{ "_id": 2, "A": [ 1, 2 ], "B": [ 2, 1, 2 ] }
{ "_id": 3, "A": [ 1, 2 ], "B": [ 1, 2, 3 ] }
{ "_id": 4, "A": [ 1, 2 ], "B": [ 3, 1 ] }
{ "_id": 5, "A": [ 1, 2 ], "B": [ ] }
{ "_id": 6, "A": [ 1, 2 ], "B": [ {}, [] ] }
{ "_id": 7, "A": [ ], "B": [ ] }
{ "_id": 8, "A": [ ], "B": [ 1 ] }
```

下面的代码使用 `setDifference`，找到只存在于 `B` 中的数字：

```js
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
    .collection('test')
    .aggregate()
    .project({
      isBOnly: $.setDifference(['$B', '$A'])
    })
    .end()
  console.log(res.data)
}
```

```json
{ "_id": 1, "isBOnly": [] }
{ "_id": 2, "isBOnly": [3] }
{ "_id": 3, "isBOnly": [3] }
{ "_id": 4, "isBOnly": [5] }
{ "_id": 5, "isBOnly": [] }
{ "_id": 6, "isBOnly": [{}, []] }
{ "_id": 7, "isBOnly": [] }
{ "_id": 8, "isBOnly": [1] }
```
