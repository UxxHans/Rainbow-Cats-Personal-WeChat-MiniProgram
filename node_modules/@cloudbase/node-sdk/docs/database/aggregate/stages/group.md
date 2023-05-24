# Aggregate.group

### 1. 接口描述

功能: 将输入记录按给定表达式分组，输出时每个记录代表一个分组，每个记录的 `_id` 是区分不同组的 key。输出记录中也可以包括累计值，将输出字段设为累计值即会从该分组中计算累计值。

声明: `group({ _id: <expression>, <field1>: <accumulator1>, ... <fieldN>: <accumulatorN> })`

### 2. 输入参数

| 参数   | 类型                           | 必填 | 说明                                                                                   |
| ------ | ------------------------------ | ---- | -------------------------------------------------------------------------------------- |
| \_id   | [expression](../expression.md) | 是   | 是用于区分不同组的 key                                                                 |
| fieldN | [expression](../expression.md) | 否   | fieldN 这些其他字段是可选的，都是累计值，用 `$.sum` 等累计器，但也可以使用其他表达式。 |

累计器必须是以下操作符之一：

- addToSet
- avg
- first
- last
- max
- min
- push
- stdDevPop
- stdDevSamp
- sum

#### 内存限制

该阶段有 100M 内存使用限制。

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

#### 按字段值分组

假设集合 `avatar` 有如下记录：

```
{
  _id: "1",
  alias: "john",
  region: "asia",
  scores: [40, 20, 80],
  coins: 100
}
{
  _id: "2",
  alias: "arthur",
  region: "europe",
  scores: [60, 90],
  coins: 20
}
{
  _id: "3",
  alias: "george",
  region: "europe",
  scores: [50, 70, 90],
  coins: 50
}
{
  _id: "4",
  alias: "john",
  region: "asia",
  scores: [30, 60, 100, 90],
  coins: 40
}
{
  _id: "5",
  alias: "george",
  region: "europe",
  scores: [20],
  coins: 60
}
{
  _id: "6",
  alias: "john",
  region: "asia",
  scores: [40, 80, 70],
  coins: 120
}
```

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
    .collection('avatar')
    .aggregate()
    .group({
      _id: '$alias',
      num: $.sum(1)
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{
  "_id": "john",
  "num": 3
}
{
  "_id": "authur",
  "num": 1
}
{
  "_id": "george",
  "num": 2
}
```

#### 按多个值分组

可以给 `_id` 传入记录的方式按多个值分组。还是沿用上面的示例数据，按各个区域（region）获得相同最高分（score）的来分组，并求出各组虚拟币（coins）的总量：

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
    .collection('avatar')
    .aggregate()
    .group({
      _id: {
        region: '$region',
        maxScore: $.max('$scores')
      },
      totalCoins: $.sum('$coins')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{
  "_id": {
    "region": "asia",
    "maxScore": 80
  },
  "totalCoins": 220
}
{
  "_id": {
    "region": "asia",
    "maxScore": 100
  },
  "totalCoins": 100
}
{
  "_id": {
    "region": "europe",
    "maxScore": 90
  },
  "totalCoins": 70
}
{
  "_id": {
    "region": "europe",
    "maxScore": 20
  },
  "totalCoins": 60
}
```
