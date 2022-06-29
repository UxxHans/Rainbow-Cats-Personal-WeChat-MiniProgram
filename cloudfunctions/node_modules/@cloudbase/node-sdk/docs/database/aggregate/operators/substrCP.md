# db.command.aggregate.substrCP

### 1. 操作符描述

功能：返回字符串从指定位置开始的指定长度的子字符串。子字符串是由字符串中指定的 `UTF-8` 字节索引的字符开始，长度为指定的字节数。

声明：``db.command.aggregate.substrCP([<表达式1>, <表达式2>, <表达式3>])`

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
{ "name": "dongyuanxin", "nickname": "心谭" }
```

借助 `substrCP` 可以提取 `nickname` 字段值的第一个汉字：

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
      firstCh: $.substrCP(['$nickname', 0, 1])
    })
    .end()
  console.log(res.data)
}
```

返回的结果如下：

```json
{ "firstCh": "心" }
```
