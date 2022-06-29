# Aggregate.count

### 1. 接口描述

功能: 聚合阶段。计算输入记录数，输出一个记录，其中指定字段的值为记录数。`count` 阶段等同于 `group` + `project` 的操作。

声明: `count(string)`

### 2. 输入参数

| 参数 | 类型                           | 必填 | 说明                                                                                    |
| ---- | ------------------------------ | ---- | --------------------------------------------------------------------------------------- |
| -    | [expression](../expression.md) | 是   | `string` 是输出记录数的字段的名字，不能是空字符串，不能以 `$` 开头，不能包含 `.` 字符。 |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

假设集合 `items` 有如下记录：

```
{
  _id: "1",
  price: 10.5
}
{
  _id: "2",
  price: 50.3
}
{
  _id: "3",
  price: 20.8
}
{
  _id: "4",
  price: 80.2
}
{
  _id: "5",
  price: 200.3
}
```

找出加个大于 50 的记录数：

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
      price: _.gt(50)
    })
    .count('expensiveCount')
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{
  "expensiveCount": 3
}
```
