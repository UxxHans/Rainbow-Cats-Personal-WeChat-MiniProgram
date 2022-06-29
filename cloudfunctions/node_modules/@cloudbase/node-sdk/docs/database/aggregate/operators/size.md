# db.command.aggregate.size

### 1. 操作符描述

功能：返回数组长度。

声明：``db.command.aggregate.size(array)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                           |
| ---- | ------------------------------ | ---- | ------------------------------ |
| -    | [Expression](../expression.md) | 是   | 可以是任意解析为数组的表达式。 |

### 3. 示例代码

假设集合 `shops` 有如下记录：

```json
{ "_id": 1, "staff": [ "John", "Middleton", "George" ] }
{ "_id": 2, "staff": [ "Steph", "Jack" ] }
```

计算各个商店的雇员数量：

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
    .collection('staff')
    .aggregate()
    .project({
      totalStaff: $.size('$staff')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "totalStaff": 3 }
{ "_id": 2, "totalStaff": 2 }
```
