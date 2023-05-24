# db.command.aggregate.reduce

### 1. 操作符描述

功能：类似 JavaScript 的 `reduce` 方法，应用一个表达式于数组各个元素然后归一成一个元素。

声明：`db.command.aggregate.reduce({ input: array initialValue: expression, in: expression })`

### 2. 操作符参数

| 字段         | 类型                           | 必填 | 说明                                                                                                              |
| ------------ | ------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------- |
| input        | [Expression](../expression.md) | 是   | 输入数组，可以是任意解析为数组的表达式                                                                            |
| initialValue | [Expression](../expression.md) | 是   | 初始值                                                                                                            |
| in           | [Expression](../expression.md) | 是   | 用来作用于每个元素的表达式，在 `in` 中有两个可用变量，`value` 是表示累计值的变量，`this` 是表示当前数组元素的变量 |

### 3. 示例代码

#### 简易字符串拼接

假设集合 `player` 有如下记录：

```json
{ "_id": 1, "fullname": [ "Stephen", "Curry" ] }
{ "_id": 2, "fullname": [ "Klay", "Thompsom" ] }
```

获取各个球员的全名，并加 `Player:` 前缀：

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
    .collection('player')
    .aggregate()
    .project({
      info: $.reduce({
        input: '$fullname',
        initialValue: 'Player:',
        in: $.concat(['$$value', ' ', '$$this'])
      })
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "info": "Player: Stephen Curry" }
{ "_id": 2, "info": "Player: Klay Thompson" }
```

获取各个球员的全名，不加前缀：

```js
const $ = db.command.aggregate
db.collection('player')
  .aggregate()
  .project({
    name: $.reduce({
      input: '$fullname',
      initialValue: '',
      in: $.concat([
        '$$value',
        $.cond({
          if: $.eq(['$$value', '']),
          then: '',
          else: ' '
        }),
        '$$this'
      ])
    })
  })
  .end()
```

返回结果如下：

```json
{ "_id": 1, "name": "Stephen Curry" }
{ "_id": 2, "name": "Klay Thompson" }
```
