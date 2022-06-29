# db.command.aggregate.substrBytes

### 1. 操作符描述

功能：返回字符串从指定位置开始的指定长度的子字符串。子字符串是由字符串中指定的 `UTF-8` 字节索引的字符开始，长度为指定的字节数。

声明：``db.command.aggregate.substrBytes([<表达式1>, <表达式2>, <表达式3>])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                 |
| ---- | ------------------------------------------- | ---- | ------------------------------------ |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组，各位置表达式详述如下 |

参数说明:

`表达式1` 是任何可以解析为字符串的有效表达式，`表达式2` 和 `表达式3` 是任何可以解析为数字的有效表达式。

如果 `表达式2` 是负数，返回的结果为 `""`。

如果 `表达式3` 是负数，返回的结果为从 `表达式2` 指定的开始位置以及之后其余部分的子字符串。

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "birthday": "1999/12/12", "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "birthday": "1998/11/11", "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "birthday": "1997/10/10", "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `substrBytes` 可以提取 `birthday` 中的年、月、日信息，代码如下：

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
      year: $.substrBytes(['$birthday', 0, 4]),
      month: $.substrBytes(['$birthday', 5, 2]),
      day: $.substrBytes(['$birthday', 8, -1])
    })
    .end()
  console.log(res.data)
}
```

返回的结果如下：

```json
{ "day": "12", "month": "12", "year": "1999" }
{ "day": "11", "month": "11", "year": "1998" }
{ "day": "10", "month": "10", "year": "1997" }
```
