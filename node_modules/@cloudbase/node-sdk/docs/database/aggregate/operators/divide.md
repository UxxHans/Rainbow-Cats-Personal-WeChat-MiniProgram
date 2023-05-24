# db.command.aggregate.divide

### 1. 操作符描述

功能：传入被除数和除数，求商。

声明：`db.command.aggregate.divide([<被除数表达式>, <除数表达式>])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                 |
| ---- | ------------------------------------------- | ---- | ------------------------------------ |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 表达式可以是任意解析为数字的表达式。 |

### 3. 示例代码

假设集合 `railroads` 有如下记录：

```
{ _id: 1, meters: 5300 }
{ _id: 2, meters: 64000 }
{ _id: 3, meters: 130 }
```

可以用如下方式取各个数字转换为千米之后的值：

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
    .collection('railroads')
    .aggregate()
    .project({
      km: $.divide(['$meters', 1000])
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{ _id: 1, km: 5.3 }
{ _id: 2, km: 64 }
{ _id: 3, km: 0.13 }
```
