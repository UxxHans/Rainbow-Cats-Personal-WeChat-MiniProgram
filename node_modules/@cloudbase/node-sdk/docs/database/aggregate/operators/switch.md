# db.command.aggregate.switch

### 1. 操作符描述

功能：根据给定的 `switch-case-default` 计算返回值、

声明：``db.command.aggregate.switch({ branches: [ case: <表达式>, then: <表达式>, case: <表达式>, then: <表达式>, ... ], default: <表达式> })`

### 2. 操作符参数

| 字段 | 类型   | 必填 | 说明                                                 |
| ---- | ------ | ---- | ---------------------------------------------------- |
| -    | Object | 是   | switch-case-default 语句中各表达式可为任意聚合表达式 |

### 3. 示例代码

假设集合 `items` 的记录如下：

```json
{ "_id": "0", "name": "item-a", "amount": 100 }
{ "_id": "1", "name": "item-b", "amount": 200 }
{ "_id": "2", "name": "item-c", "amount": 300 }
```

我们可以使用 `switch`，根据 `amount` 字段，来生成新的字段 `discount`：

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
      name: 1,
      discount: $.switch({
        branches: [
          { case: $.gt(['$amount', 250]), then: 0.8 },
          { case: $.gt(['$amount', 150]), then: 0.9 }
        ],
        default: 1
      })
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "_id": "0", "name": "item-a", "discount": 1 }
{ "_id": "1", "name": "item-b", "discount": 0.9 }
{ "_id": "2", "name": "item-c", "discount": 0.8 }
```
