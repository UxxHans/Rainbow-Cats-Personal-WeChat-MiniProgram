# db.command.aggregate.cmp

### 1. 操作符描述

功能：给定两个值，返回其比较值。

声明：`db.command.aggregate.cmp([expression1, expression2])`

- 如果第一个值小于第二个值，返回 -1
- 如果第一个值大于第二个值，返回 1
- 如果两个值相等，返回 0

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                   |
| ---- | ------------------------------------------- | ---- | ---------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 含两个聚合表达式的数组 |

### 3. 示例代码

假设集合 `price` 有如下记录：

```json
{ "_id": 1, "shop1": 10, "shop2": 100 }
{ "_id": 2, "shop1": 80, "shop2": 20 }
{ "_id": 3, "shop1": 50, "shop2": 50 }
```

求 `shop1` 和 `shop2` 的各个物品的价格对比。

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk');
const app = tcb.init({
  env:'xxx'
})

const db = app.database();
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db.collection('price').aggregate()
    .project({
      compare: $.cmp(['$shop1', '$shop2']))
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "compare": -1 }
{ "_id": 2, "compare": 1 }
{ "_id": 3, "compare": 0 }
```
