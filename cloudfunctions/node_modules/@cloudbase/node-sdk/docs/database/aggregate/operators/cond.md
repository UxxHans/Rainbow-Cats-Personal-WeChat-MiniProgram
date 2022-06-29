# db.command.aggregate.cond

### 1. 操作符描述

功能：计算布尔表达式，返回指定的两个值其中之一。

声明：

两种形式

1. `cond({ if: <布尔表达式>, then: <真值>, else: <假值> })`

2. `cond([ <布尔表达式>, <真值>, <假值> ])`

注意事项：

> 两种形式中，三个参数（`if`、`then`、`else`）都是必须的。

> 如果布尔表达式为真，那么 `$cond` 将会返回 `<真值>`，否则会返回 `<假值>`

### 2. 操作符参数

| 字段 | 类型                         | 必填 | 说明                 |
| ---- | ---------------------------- | ---- | -------------------- |
| -    | Object or &lt;Array&gt;[any] | 是   | 两种形式(如声明说示) |

### 3. 示例代码

假设集合 `items` 的记录如下：

```json
{ "_id": "0", "name": "item-a", "amount": 100 }
{ "_id": "1", "name": "item-b", "amount": 200 }
{ "_id": "2", "name": "item-c", "amount": 300 }
```

我们可以使用 `cond`，根据 `amount` 字段，来生成新的字段 `discount`：

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
    .collection('items')
    .aggregate()
    .project({
      name: 1,
      discount: $.cond({
        if: $.gte(['$amount', 200]),
        then: 0.7,
        else: 0.9
      })
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "_id": "0", "name": "item-a", "discount": 0.9 }
{ "_id": "1", "name": "item-b", "discount": 0.7 }
{ "_id": "2", "name": "item-c", "discount": 0.7 }
```
