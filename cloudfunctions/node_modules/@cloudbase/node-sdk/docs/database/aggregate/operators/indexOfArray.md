# db.command.aggregate.indexOfArray

### 1. 操作符描述

功能：在数组中找出等于给定值的第一个元素的下标，如果找不到则返回 -1。

声明：`db.command.aggregate.indexOfArray([ <array expression>, <search expression>, <start>, <end> ])`

### 2. 操作符参数

| 字段 | 类型             | 必填 | 说明               |
| ---- | ---------------- | ---- | ------------------ |
| -    | &lt;Array&gt;any | 是   | 各位置元素详述如下 |

| 字段       | 类型    | 必填 | 说明                                                                                                         |
| ---------- | ------- | ---- | ------------------------------------------------------------------------------------------------------------ |
| `<array>`  | string  | 是   | 一个可以解析为数组的表达式，如果解析为 null，则 `indexOfArray` 返回 null                                     |
| `<search>` | string  | 是   | 对数据各个元素应用的条件匹配表达式                                                                           |
| `<start>`  | integer | 否   | 用于指定搜索的开始下标，必须是非负整数                                                                       |
| `<end>`    | integer | 否   | 用于指定搜索的结束下标，必须是非负整数，指定了 `<end>` 时也应指定 `<start>`，否则 `<end>` 默认当做 `<start>` |

### 3. 示例代码

假设集合 `stats` 有如下记录：

```json
{
  "_id": 1,
  "sales": [ 1, 6, 2, 2, 5 ]
}
{
  "_id": 2,
  "sales": [ 4, 2, 1, 5, 2 ]
}
{
  "_id": 3,
  "sales": [ 2, 5, 3, 3, 1 ]
}
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
      index: $.indexOfArray(['$sales', 2, 2])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "index": 2 }
{ "_id": 2, "index": 4 }
{ "_id": 3, "index": -1 }
```
