# db.command.aggregate.concat

### 1. 操作符描述

功能：连接字符串，返回拼接后的字符串。

声明：`db.command.aggregate.concat([expression1, expression2, ...])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                                                                      |
| ---- | ------------------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 数组中的表达式可以是形如 `$ + 指定字段`，也可以是普通字符串。只要能够被解析成字符串即可。 |

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `concat` 可以拼接 `lastName` 和 `firstName` 字段，得到每位学生的名字全称：

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('students')
    .aggregate()
    .project({
      _id: 0,
      fullName: $.concat(['$firstName', ' ', '$lastName'])
    })
    .end()
  console.log(res.data)
}
```

返回的结果如下：

```json
{ "fullName": "Yuanxin Dong" }
{ "fullName": "Weijia Wang" }
{ "fullName": "Chengxi Li" }
```
