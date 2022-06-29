# db.command.aggregate.objectToArray

### 1. 操作符描述

功能：将一个对象转换为数组。方法把对象的每个键值对都变成输出数组的一个元素，元素形如 `{ k: <key>, v: <value> }`。

声明：`db.command.aggregate.objectToArray(object)`

### 2. 操作符参数

| 字段 | 类型   | 必填 | 说明       |
| ---- | ------ | ---- | ---------- |
| -    | Object | 是   | 键值对对象 |

### 3. 示例代码

假设集合 `items` 有如下记录：

```json
{ "_id": 1, "attributes": { "color": "red", "price": 150 } }
{ "_id": 2, "attributes": { "color": "blue", "price": 50 } }
{ "_id": 3, "attributes": { "color": "yellow", "price": 10 } }
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
    .collection('items')
    .aggregate()
    .project({
      array: $.objectToArray('$attributes')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "array": [{ "k": "color", "v": "red" }, { "k": "price", "v": 150 }] }
{ "_id": 2, "array": [{ "k": "color", "v": "blue" }, { "k": "price", "v": 50 }] }
{ "_id": 3, "array": [{ "k": "color", "v": "yellow" }, { "k": "price", "v": 10 }] }
```
