# db.command.aggregate.trunc

### 1. 操作符描述

功能：将数字截断为整形。

声明：`db.command.aggregate.trunc(number)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                               |
| ---- | ------------------------------ | ---- | ---------------------------------- |
| -    | [Expression](../expression.md) | 是   | 参数可以是任意解析为数字的表达式。 |

### 3. 示例代码

假设集合 `scores` 有如下记录：

```json
{ "_id": 1, "value": 1.21 }
{ "_id": 2, "value": 3.83 }
{ "_id": 3, "value": -4.94 }
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
    .collection('scores')
    .aggregate()
    .project({
      int: $.trunc('$value')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "value": 1 }
{ "_id": 2, "value": 3 }
{ "_id": 3, "value": -4 }
```
