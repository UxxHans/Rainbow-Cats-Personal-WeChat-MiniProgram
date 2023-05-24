# db.command.aggregate.toLower

### 1. 操作符描述

功能：将字符串转化为小写并返回。

声明：`db.command.aggregate.toLower(<表达式>)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                                                       |
| ---- | ------------------------------ | ---- | -------------------------------------------------------------------------- |
| -    | [Expression](../expression.md) | 是   | 只要表达式可以被解析成字符串，那么它就是有效表达式。例如：`$ + 指定字段`。 |

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `toLower` 将 `firstName` 的字段值转化为小写：

```javascript
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
    .collection('students')
    .aggregate()
    .project({
      _id: 0,
      result: $.toLower('$firstName')
    })
    .end()
  console.log(res.data)
}
```

返回的结果如下：

```json
{ "result": "yuanxin" }
{ "result": "weijia" }
{ "result": "chengxi" }
```
