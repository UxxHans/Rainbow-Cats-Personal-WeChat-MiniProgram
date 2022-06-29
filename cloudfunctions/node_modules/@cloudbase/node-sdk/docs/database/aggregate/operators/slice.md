# db.command.aggregate.slice

### 1. 操作符描述

功能：类似 JavaScritp 的 `slice` 方法。返回给定数组的指定子集。

声明：``db.command.aggregate.slice([array, n])`

语法有两种：

返回从开头或结尾开始的 `n` 个元素：

```
db.command.aggregate.slice([array, n])
```

返回从指定位置算作数组开头、再向后或向前的 `n` 个元素：

```
db.command.aggregate.slice([array, position, n])
```

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                   |
| ---- | ------------------------------------------- | ---- | ---------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 数组各位置元素详述如下 |

数组元素说明：

`<array>` 可以是任意解析为数组的表达式。

`<position>` 可以是任意解析为整形的表达式。如果是正数，则将数组的第 `<position>` 个元素作为数组开始；如果 `<position>` 比数组长度更长，`slice` 返回空数组。如果是负数，则将数组倒数第 `<position>` 个元素作为数组开始；如果 `<position>` 的绝对值大于数组长度，则开始位置即为数组开始位置。

`<n>` 可以是任意解析为整形的表达式。如果 `<position>` 有提供，则 `<n>` 必须为正整数。如果是正数，`slice` 返回前 `n` 个元素。如果是负数，`slice` 返回后 `n` 个元素。

### 3. 示例代码

假设集合 `people` 有如下记录：

```json
{ "_id": 1, "hobbies": [ "basketball", "football", "tennis", "badminton" ] }
{ "_id": 2, "hobbies": [ "golf", "handball" ] }
{ "_id": 3, "hobbies": [ "table tennis", "swimming", "rowing" ] }
```

统一返回前两个爱好：

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
    .collection('fruits')
    .aggregate()
    .project({
      hobbies: $.slice(['$hobbies', 2])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "_id": 1, "hobbies": [ "basketball", "football" ] }
{ "_id": 2, "hobbies": [ "golf", "handball" ] }
{ "_id": 3, "hobbies": [ "table tennis", "swimming" ] }
```
