# db.command.aggregate.split

### 1. 操作符描述

功能：按照分隔符分隔数组，并且删除分隔符，返回子字符串组成的数组。如果字符串无法找到分隔符进行分隔，返回原字符串作为数组的唯一元素。

声明：``db.command.aggregate.split([字符串表达式, 分隔符表达式])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                                                             |
| ---- | ------------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 字符串表达式和分隔符表达式可以是任意形式的表达式，只要它可以被解析为字符串即可。 |

### 3. 示例代码

假设集合 `students` 的记录如下：

```json
{ "birthday": "1999/12/12" }
{ "birthday": "1998/11/11" }
{ "birthday": "1997/10/10" }
```

通过 `split` 将每条记录中的 `birthday` 字段对应值分隔成数组，每个数组分别由代表年、月、日的 3 个元素组成：

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
      birthday: $.split(['$birthday', '/'])
    })
    .end()
  console.log(res.data)
}
```

返回的结果如下：

```json
{ "birthday": [ "1999", "12", "12" ] }
{ "birthday": [ "1998", "11", "11" ] }
{ "birthday": [ "1997", "10", "10" ] }
```
