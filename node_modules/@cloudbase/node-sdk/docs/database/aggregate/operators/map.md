# db.command.aggregate.map

### 1. 操作符描述

功能：类似 JavaScript Array 上的 `map` 方法，将给定数组的每个元素按给定转换方法转换后得出新的数组。

声明：`db.command.aggregate.map({ input: expression, as: string, in: expression })`

### 2. 操作符参数

| 字段  | 类型                           | 必填 | 说明                                                                                                            |
| ----- | ------------------------------ | ---- | --------------------------------------------------------------------------------------------------------------- |
| input | [Expression](../expression.md) | 是   | 一个可以解析为数组的表达式                                                                                      |
| as    | string                         | 否   | 可选，用于表示数组各个元素的变量，默认为 this                                                                   |
| in    | [Expression](../expression.md) | 是   | 一个可以应用在给定数组的各个元素上的表达式，各个元素的名字由 `as` 参数决定（参数名需加 `$$` 前缀，如 `$$this`） |

### 3. 示例代码

假设集合 `stats` 有如下记录：

```json
{
  "_id": 1,
  "sales": [ 1.32, 6.93, 2.48, 2.82, 5.74 ]
}
{
  "_id": 2,
  "sales": [ 2.97, 7.13, 1.58, 6.37, 3.69 ]
}
```

将各个数字截断为整形，然后求和

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('stats')
    .aggregate()
    .project({
      truncated: $.map({
        input: '$sales',
        as: 'num',
        in: $.trunc('$$num')
      })
    })
    .project({
      total: $.sum('$truncated')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "index": 16 }
{ "_id": 2, "index": 19 }
```
