# db.command.aggregate.indexOfCP

### 1. 操作符描述

功能：在目标字符串中查找子字符串，并返回第一次出现的 `UTF-8` 的 `code point` 索引（从 0 开始）。如果不存在子字符串，返回 -1。

声明：`db.command.aggregate.indexOfCP([<目标字符串表达式>, <子字符串表达式>, <开始位置表达式>, <结束位置表达式>])`

注意事项:

> `code point` 是“码位”，又名“编码位置”。这里特指 `Unicode` 包中的码位，范围是从 0（16 进制）到 10FFFF（16 进制）。

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                               |
| ---- | ------------------------------------------- | ---- | ---------------------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 聚合表达式数组，各位置元素含义如下 |

下面是 4 种表达式的详细描述：

| 表达式           | 描述                             |
| ---------------- | -------------------------------- |
| 目标字符串表达式 | 任何可以被解析为字符串的表达式   |
| 子字符串表达式   | 任何可以被解析为字符串的表达式   |
| 开始位置表达式   | 任何可以被解析为非负整数的表达式 |
| 结束位置表达式   | 任何可以被解析为非负整数的表达式 |

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "firstName": "Yuanxin", "group": "a", "lastName": "Dong", "score": 84 }
{ "firstName": "Weijia", "group": "a", "lastName": "Wang", "score": 96 }
{ "firstName": "Chengxi", "group": "b", "lastName": "Li", "score": 80 }
```

借助 `indexOfCP` 查找字符 `"a"` 在字段 `firstName` 中的位置：

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
      aStrIndex: $.indexOfCP(['$firstName', 'a'])
    })
    .end()
  console.log(res.data)
}
```

返回的结果如下：

```json
{ "aStrIndex": 2 }
{ "aStrIndex": 5 }
{ "aStrIndex": -1 }
```
