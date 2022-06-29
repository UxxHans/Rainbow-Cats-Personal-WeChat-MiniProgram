# db.command.aggregate.filter

### 1. 操作符描述

功能：根据给定条件返回满足条件的数组的子集。

声明：`db.command.aggregate.filter({
input: array,
as: string,
cond: expression
})`

### 2. 操作符参数

| 字段  | 类型                           | 必填 | 说明                                                                                                                            |
| ----- | ------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| input | [Expression](../expression.md) | 是   | 一个可以解析为数组的表达式                                                                                                      |
| as    | string                         | 否   | 可选，用于表示数组各个元素的变量，默认为 this                                                                                   |
| cond  | [Expression](../expression.md) | 是   | 一个可以解析为布尔值的表达式，用于判断各个元素是否满足条件，各个元素的名字由 `as` 参数决定（参数名需加 `$$` 前缀，如 `$$this`） |

### 3. 示例代码

假设集合 `fruits` 有如下记录：

```json
{
  "_id": 1,
  "stock": [
    { "name": "apple", "price": 10 },
    { "name": "orange", "price": 20 }
  ],
}
{
  "_id": 2,
  "stock": [
    { "name": "lemon", "price": 15 },
  ],
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
    .collection('fruits')
    .aggregate()
    .project({
      stock: $.filter({
        input: '$stock',
        as: 'item',
        cond: $.gte(['$$item.price', 15])
      })
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "stock": [ { "name": "orange", "price": 20} ] }
{ "_id": 2, "stock": [ { "name": "lemon", "price": 15 } ] }
```
