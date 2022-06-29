# db.command.aggregate.anyElementTrue

### 1. 操作符描述

功能：输入一个数组，或者数组字段的表达式。如果数组中任意一个元素为真值，那么返回 `true`，否则返回 `false`。空数组永远返回 `false`。

声明：`db.command.aggregate.anyElementTrue([expression])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明       |
| ---- | ------------------------------------------- | ---- | ---------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式 |

### 3. 示例代码

假设集合 `test` 有如下记录：

```json
{ "_id": 1, "array": [ true ] }
{ "_id": 2, "array": [ ] }
{ "_id": 3, "array": [ false ] }
{ "_id": 4, "array": [ true, false ] }
{ "_id": 5, "array": [ 0 ] }
{ "_id": 6, "array": [ "stark" ] }
```

下面的代码使用 `anyElementTrue()`，判断 `array` 字段中是否含有真值：

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
    .collection('price')
    .aggregate()
    .project({
      isAnyTrue: $.anyElementTrue(['$array'])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "isAnyTrue": true }
{ "_id": 2, "isAnyTrue": false }
{ "_id": 3, "isAnyTrue": false }
{ "_id": 4, "isAnyTrue": true }
{ "_id": 5, "isAnyTrue": false }
{ "_id": 6, "isAnyTrue": true }
```
