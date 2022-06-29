# Aggregate.bucket

### 1. 接口描述

功能: 聚合阶段。将输入记录根据给定的条件和边界划分成不同的组，每组即一个 `bucket`。

声明:

`bucket({ groupBy: <expression>, boundaries: [<lowerbound1>, <lowerbound2>, ...], default: <literal>, output: { <output1>: <accumulator expr>, ... <outputN>: <accumulator expr> } })`

注意事项：

> 每组分别作为一个记录输出，包含一个以下界为值的 `_id` 字段和一个以组中记录数为值的 `count` 字段。`count` 在没有指定 `output` 的时候是默认输出的。

> `bucket` 只会在组内有至少一个记录的时候输出。

> 使用 `bucket` 需要满足以下至少一个条件，否则会抛出错误：

- 每一个输入记录应用 `groupBy` 表达式获取的值都必须是一个在 `boundaries` 内的值
- 指定一个 `default` 值，该值在 `boundaries` 以外，或与 `boundaries` 元素的值不同的类型。

### 2. 输入参数

| 参数       | 类型                           | 必填 | 说明         |
| ---------- | ------------------------------ | ---- | ------------ |
| groupBy    | [expression](../expression.md) | 是   | 字段详述如下 |
| boundaries | Array                          | 是   | 字段详述如下 |
| default    | any                            | 否   | 字段详述如下 |
| output     | Object                         | 否   | 字段详述如下 |

> `groupBy` 是一个用以决定分组的表达式，会应用在各个输入记录上。可以用 `$` 前缀加上要用以分组的字段路径来作为表达式。除非用 `default` 指定了默认值，否则每个记录都需要包含指定的字段，且字段值必须在 `boundaries` 指定的范围之内。

> `boundaries` 是一个数组，每个元素分别是每组的下界。必须至少指定两个边界值。数组值必须是同类型递增的值。

> `default` 可选，指定之后，没有进入任何分组的记录将都进入一个默认分组，这个分组记录的 `_id` 即由 `default` 决定。`default` 的值必须小于 `boundaries` 中的最小值或大于等于其中的最大值。`default` 的值可以与 `boundaries` 元素值类型不同。

> `output` 可选，用以决定输出记录除了 `_id` 外还要包含哪些字段，各个字段的值必须用累加器表达式指定。当 `output` 指定时，默认的 `count` 是不会被默认输出的，必须手动指定：

```
output: {
  count: $.sum(1),
  ...
  <outputN>: <accumulator expr>
}
```

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

对上述记录进行分组，将 [0, 50) 分为一组，[50, 100) 分为一组，其他分为一组：

```js
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
    .bucket({
      groupBy: '$price',
      boundaries: [0, 50, 100],
      default: 'other',
      output: {
        count: $.sum(),
        ids: $.push('$_id')
      }
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
[
  {
    "_id": 0,
    "count": 2,
    "ids": [
      "1",
      "3"
    ]
  },
  {
    "_id": 50,
    "count": 2,
    "ids": [
      "2",
      "4"
    ]
  },
  {
    "_id": "other",
    "count": 1,
    "ids": [
      "5"
    ]
  }
]
```
