# db.command.aggregate.arrayToObject

### 1. 操作符描述

功能：将一个数组转换为对象。

声明：

两种形式

1. 传入一个二维数组，第二维的数组长度必须为 2，其第一个值为字段名，第二个值为字段值

`db.command.aggregate.arrayToObject([ [key1, value1], [key2, value2], ... ])`

2. 传入一个对象数组，各个对象必须包含字段 `k` 和 `v`，分别指定字段名和字段值

`db.command.aggregate.arrayToObject([ { "k": key1, "v": value1 }, { "k": key2, "v": value2 }, ... ])`

### 2. 操作符参数

| 字段 | 类型                          | 必填 | 说明         |
| ---- | ----------------------------- | ---- | ------------ |
| -    | &lt;Array&gt; Array Or Object | 是   | 如声明中所述 |

### 3. 示例代码

假设集合 `shops` 有如下记录：

```json
{ "_id": 1, "sales": [ ["max", 100], ["min", 50] ] }
{ "_id": 2, "sales": [ ["max", 70], ["min", 60] ] }
{ "_id": 3, "sales": [ { "k": "max", "v": 50 }, { "k": "min", "v": 30 } ] }
```

求各个第一次考试的分数和和最后一次的分数：

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
    .collection('shops')
    .aggregate()
    .project({
      sales: $.arrayToObject('$sales')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "sales": { "max": 100, "min": 50 } }
{ "_id": 2, "sales": { "max": 70, "min": 60 } }
{ "_id": 3, "sales": { "max": 50, "min": 30 } }
```
