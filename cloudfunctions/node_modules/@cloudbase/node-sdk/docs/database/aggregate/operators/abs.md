# db.command.aggregate.abs

### 1. 操作符描述

功能：返回一个数字参数的绝对值。

声明：`db.command.aggregate.abs(num)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                     |
| ---- | ------------------------------ | ---- | ------------------------ |
| -    | [Expression](../expression.md) | 是   | 聚合表达式(可解析为数字) |

注意事项:

> 如果表达式解析为 `null` 或者指向一个不存在的字段，则 `abs` 的结果是 `null`。如果值解析为 `NaN`，则结果是 `NaN`。

### 3. 示例代码

假设集合 `ratings` 有如下记录：

```
{ _id: 1, start: 5, end: 8 }
{ _id: 2, start: 4, end: 4 }
{ _id: 3, start: 9, end: 7 }
{ _id: 4, start: 6, end: 7 }
```

···
可以用如下方式求得各个记录的 `start` 和 `end` 之间的绝对差异大小：

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
    .collection('ratings')
    .aggregate()
    .project({
      delta: $.abs($.subtract(['$start', '$end']))
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{ "_id" : 1, "delta" : 3 }
{ "_id" : 2, "delta" : 0 }
{ "_id" : 3, "delta" : 2 }
{ "_id" : 4, "delta" : 1 }
```
