# Aggregate.limit

### 1. 接口描述

功能: 聚合阶段。限制输出到下一阶段的记录数。

声明: `limit(number)`

### 2. 输入参数

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| -    | number | 是   | 正整数 |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

假设集合 `items` 有如下记录：

```
{
  _id: "1",
  price: 10
}
{
  _id: "2",
  price: 50
}
{
  _id: "3",
  price: 20
}
{
  _id: "4",
  price: 80
}
{
  _id: "5",
  price: 200
}
```

返回加个大于 20 的记录的最小的两个记录：

```js
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
    .match({
      price: _.gt(20)
    })
    .sort({
      price: 1
    })
    .limit(2)
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{
  "_id": "3",
  "price": 20
}
{
  "_id": "4",
  "price": 80
}
```
