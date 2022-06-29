# db.command.aggregate.range

### 1. 操作符描述

功能：返回一组生成的序列数字。给定开始值、结束值、非零的步长，`range` 会返回从开始值开始逐步增长、步长为给定步长、但不包括结束值的序列。

声明：`db.command.aggregate.range([<start>, <end>, <non-zero step>])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明           |
| ---- | ------------------------------------------- | ---- | -------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组 |

| 字段          | 类型                           | 必填 | 说明                                                 |
| ------------- | ------------------------------ | ---- | ---------------------------------------------------- |
| start         | [Expression](../expression.md) | 是   | 开始值，一个可以解析为整形的表达式                   |
| end           | [Expression](../expression.md) | 是   | 结束值，一个可以解析为整形的表达式                   |
| non-zero step | number                         | 否   | 可选，步长，一个可以解析为非零整形的表达式，默认为 1 |

### 3. 示例代码

假设集合 `stats` 有如下记录：

```json
{ "_id": 1, "max": 52 }
{ "_id": 2, "max": 38 }
```

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
    .collection('stats')
    .aggregate()
    .project({
      points: $.range([0, '$max', 10])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "points": [0, 10, 20, 30, 40, 50] }
{ "_id": 2, "points": [0, 10, 20] }
```
