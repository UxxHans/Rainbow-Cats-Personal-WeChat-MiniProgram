# db.command.aggregate.sum

### 1. 操作符描述

功能：计算并且返回一组字段所有数值的总和。

声明：``db.command.aggregate.sum(<表达式>)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明       |
| ---- | ------------------------------ | ---- | ---------- |
| -    | [Expression](../expression.md) | 是   | 聚合表达式 |

参数说明:

表达式可以传入指定字段，也可以传入指定字段组成的列表。`sum` 会自动忽略非数字值。如果字段下的所有值均是非数字，那么结果返回 0。若传入数字常量，则当做所有记录该字段的值都给给定常量，在聚合时相加，最终值为输入记录数乘以常量。

### 3. 示例代码

假设代表商品的集合 `goods` 的记录如下：`price` 代表商品销售额，`cost` 代表商品成本

```
{ "cost": -10, "price": 100 }
{ "cost": -15, "price": 1 }
{ "cost": -10, "price": 10 }
```

#### 单独字段

借助 `sum` 可以计算所有商品的销售总和，代码如下：

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
    .collection('goods')
    .aggregate()
    .group({
      _id: null,
      totalPrice: $.sum('$price')
    })
    .end()
  console.log(res.data)
}
```

返回的数据结果如下：销售额是 111

```
{ "_id": null, "totalPrice": 111 }
```

#### 字段列表

如果需要计算所有商品的利润总额，那么需要将每条记录的 `cost` 和 `price` 相加得到此记录对应商品的利润。最后再计算所有商品的利润总额。

借助 `sum`，代码如下：

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
    .collection('goods')
    .aggregate()
    .group({
      _id: null,
      totalProfit: $.sum($.sum(['$price', '$cost']))
    })
    .end()
  console.log(res.data)
}
```

返回的数据结果如下：利润总额为 76

```
{ "_id": null, "totalProfit": 76 }
```
