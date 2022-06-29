# db.command.aggregate.strLenBytes

### 1. 操作符描述

功能：计算并返回指定字符串中 `utf-8` 编码的字节数量。

声明：``db.command.aggregate.strLenBytes(<表达式>)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                           |
| ---- | ------------------------------ | ---- | ------------------------------ |
| -    | [Expression](../expression.md) | 是   | 可以被解析成字符串的聚合表达式 |

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "name": "dongyuanxin", "nickname": "心谭" }
```

借助 `strLenBytes` 计算 `name` 字段和 `nickname` 字段对应值的字节长度：

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
      nameLength: $.strLenBytes('$name'),
      nicknameLength: $.strLenBytes('$nickname')
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```javascript
{ "nameLength": 11, "nicknameLength": 6 }
```
