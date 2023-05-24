# db.command.aggregate.ifNull

### 1. 操作符描述

功能：计算给定的表达式，如果表达式结果为 null、undefined 或者不存在，那么返回一个替代值；否则返回原值。

声明：`ifNull([ <表达式>, <替代值> ])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明           |
| ---- | ------------------------------------------- | ---- | -------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组 |

### 3. 示例代码

假设集合 `items` 的记录如下：

```json
{ "_id": "0", "name": "A", "description": "这是商品A" }
{ "_id": "1", "name": "B", "description": null }
{ "_id": "2", "name": "C" }
```

我们可以使用 `ifNull`，对不存在 `desc` 字段的文档，或者 `desc` 字段为 `null` 的文档，补充一个替代值。

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
    .collection('items')
    .aggregate()
    .project({
      _id: 0,
      name: 1,
      description: $.ifNull(['$description', '商品描述空缺'])
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "name": "A", "description": "这是商品A" }
{ "name": "B", "description": "商品描述空缺" }
{ "name": "C", "description": "商品描述空缺" }
```
