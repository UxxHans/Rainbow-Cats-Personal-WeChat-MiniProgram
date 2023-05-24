# Aggregate.bucketAuto

### 1. 接口描述

功能: 聚合阶段。将输入记录根据给定的条件划分成不同的组，每组即一个 `bucket`。

声明:

`bucket({ groupBy: <expression>, buckets: <number>, granularity: <string>, output: { <output1>: <accumulator expr>, ... <outputN>: <accumulator expr> } })`

注意事项:

> 与 [`bucket`](./bucket.md) 的其中一个不同之处在于无需指定 `boundaries`，`bucketAuto` 会自动尝试将记录尽可能平均的分散到每组中。

> 每组分别作为一个记录输出，包含一个以包含组中最大值和最小值两个字段的对象为值的 `_id` 字段和一个以组中记录数为值的 `count` 字段。`count` 在没有指定 `output` 的时候是默认输出的。

### 2. 输入参数

| 参数        | 类型                           | 必填 | 说明                       |
| ----------- | ------------------------------ | ---- | -------------------------- |
| groupBy     | [expression](../expression.md) | 是   | 字段详述如下               |
| buckets     | number                         | 是   | 用于指定划分组数的正整数。 |
| granularity | string                         | 否   | 字段详述如下               |
| output      | Object                         | 否   | 字段详述如下               |

> `groupBy` 是一个用以决定分组的表达式，会应用在各个输入记录上。可以用 `$` 前缀加上要用以分组的字段路径来作为表达式。除非用 `default` 指定了默认值，否则每个记录都需要包含指定的字段，且字段值必须在 `boundaries` 指定的范围之内。

> `granularity` 是可选枚举值字符串，用于保证自动计算出的边界符合给定的规则。这个字段仅可在所有 `groupBy` 值都是数字并且没有 `NaN` 的情况下使用。枚举值包括：`R5`、`R10`、`R20`、`R40`、`R80`、`1-2-5`、`E6`、`E12`、`E24`、`E48`、`E96`、`E192`、`POWERSOF2`。

`output` 可选，用以决定输出记录除了 `_id` 外还要包含哪些字段，各个字段的值必须用累加器表达式指定。当 `output` 指定时，默认的 `count` 是不会被默认输出的，必须手动指定：

```
output: {
  count: $.sum(1),
  ...
  <outputN>: <accumulator expr>
}
```

在以下情况中，输出的分组可能会小于给定的组数：

- 输入记录数少于分组数
- `groupBy` 计算得到的唯一值少于分组数
- `granularity` 的间距少于分组数
- `granularity` 不够精细以至于不能平均分配到各组

#### granularity 详细说明

`granularity` 用于保证边界值属于一个给定的数字序列。

**Renard 序列**

[Renard 序列](https://en.wikipedia.org/wiki/Renard_series)是以 10 的 5 / 10 / 20 / 40 / 80 次方根来推导的、在 1.0 到 10.0 (如果是 R80 则是 10.3) 之间的数字序列。

设置 `granularity` 为 R5 / R10 / R20 / R40 / R80 就把边界值限定在序列内。如果 `groupBy` 的值不在 1.0 到 10.0 (如果是 R80 则是 10.3) 内，则序列数字会自动乘以 10。

**E 序列**

[E 序列](https://en.wikipedia.org/wiki/E_series_of_preferred_numbers)是以 10 的 6 / 12 / 24 / 48 / 96 / 192 次方跟来推导的、带有一个特定误差的、在 1.0 到 10.0 之间的数字序列。

**1-2-5 序列**

[1-2-5 序列](https://en.wikipedia.org/wiki/Preferred_number#1-2-5_series) 表现与三值 Renard 序列一样。

**2 的次方序列**

由 2 的各次方组成的序列数字。

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

对上述记录进行自动分组，分成三组：

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
      buckets: 3
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{
  "_id": {
    "min": 10.5,
    "max": 50.3
  },
  "count": 2
}
{
  "_id": {
    "min": 50.3,
    "max": 200.3
  },
  "count": 2
}
{
  "_id": {
    "min": 200.3,
    "max": 200.3
  },
  "count": 1
}
```
