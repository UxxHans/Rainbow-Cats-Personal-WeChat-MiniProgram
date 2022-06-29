# db.command.aggregate.let

### 1. 操作符描述

功能：自定义变量，并且在指定表达式中使用，返回的结果是表达式的结果。

声明：`db.command.aggregate.let({ vars: { <变量1>: <变量表达式>, <变量2>: <变量表达式>, ... }, in: <结果表达式> })`

### 2. 操作符参数

| 字段 | 类型   | 必填 | 说明                                               |
| ---- | ------ | ---- | -------------------------------------------------- |
| -    | Object | 是   | 形如{ vars: {xxx:xxx, ...}, in: xxx}, 参数详述如下 |

参数说明：

`vars` 中可以定义多个变量，变量的值由 `变量表达式` 计算而来，并且被定义的变量只有在 `in` 中的 `结果表达式` 才可以访问。

在 `in` 的结果表达式中访问自定义变量时候，请在变量名前加上双美元符号( `$$` )并用引号括起来。

### 3. 示例代码

假设代表商品的集合 `goods` 的记录如下：`price` 代表商品价格，`discount` 代表商品折扣率，`cost` 代表商品成本

```
{ "cost": -10, "discount": 0.95, "price": 100 }
{ "cost": -15, "discount": 0.98, "price": 1 }
{ "cost": -10, "discount": 1, "price": 10 }
```

借助 `let` 可以定义并计算每件商品实际的销售价格，并将其赋值给自定义变量 `priceTotal`。最后再将 `priceTotal` 与 `cost` 进行取和( `sum` )运算，得到每件商品的利润。

代码如下：

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
    .project({
      profit: $.let({
        vars: {
          priceTotal: $.multiply(['$price', '$discount'])
        },
        in: $.sum(['$$priceTotal', '$cost'])
      })
    })
    .end()
  console.log(res.data)
}
```

返回的数据结果如下：

```
{ "profit": 85 }
{ "profit": -14.02 }
{ "profit": 0 }
```
