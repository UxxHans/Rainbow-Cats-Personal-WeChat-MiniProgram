# db.command.aggregate.strcasecmp

### 1. 操作符描述

功能：对两个字符串在不区分大小写的情况下进行大小比较，并返回比较的结果。

声明：``db.command.aggregate.strcasecmp([表达式1, 表达式2])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                                                                |
| ---- | ------------------------------------------- | ---- | ----------------------------------------------------------------------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组，只要 `表达式1`和 `表达式2` 可以被解析成字符串，那么它们就是有效的。 |

说明:

返回的比较结果有 1，0 和-1 三种

- 1：`表达式1` 解析的字符串 > `表达式2` 解析的字符串
- 0：`表达式1` 解析的字符串 = `表达式2` 解析的字符串
- -1：`表达式1` 解析的字符串 < `表达式2` 解析的字符串

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `strcasecmp` 比较 `firstName` 字段值和 `lastName` 字段值的大小：

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
      result: $.strcasecmp(['$firstName', '$lastName'])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```json
{ "result": 1 }
{ "result": 1 }
{ "result": -1 }
```
