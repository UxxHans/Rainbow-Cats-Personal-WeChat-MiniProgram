# db.command.aggregate.concatArrays

### 1. 操作符描述

功能：将多个数组拼接成一个数组。

声明：`db.command.aggregate.arrayToObject([ array1, array2, ... ])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                 |
| ---- | ------------------------------------------- | ---- | ------------------------------------ |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 表达式可以是任意解析为数组的表达式。 |

### 3. 示例代码

假设集合 `items` 有如下记录：

```json
{ "_id": 1, "fruits": [ "apple" ], "vegetables": [ "carrot" ] }
{ "_id": 2, "fruits": [ "orange", "lemon" ], "vegetables": [ "cabbage" ] }
{ "_id": 3, "fruits": [ "strawberry" ], "vegetables": [ "spinach" ] }
```

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
    .collection('items')
    .aggregate()
    .project({
      sales: $.concatArrays(['$fruits', '$vegetables'])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "first": 80, "last": 90 }
{ "_id": 2, "first": 78, "last": 78 }
{ "_id": 3, "first": 95, "last": 92 }
```
