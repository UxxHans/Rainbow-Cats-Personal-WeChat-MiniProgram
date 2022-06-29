# Aggregate.end

### 1. 接口描述

功能: 标志聚合操作定义完成，发起实际聚合操作

声明: `end()`

### 2. 输入参数

无

### 3. 返回结果

| 参数 | 类型              | 必填 | 说明         |
| ---- | ----------------- | ---- | ------------ |
| data | Array.&lt;any&gt; | 是   | 聚合结果列表 |

### 4. 示例代码

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('books')
    .aggregate()
    .group({
      // 按 category 字段分组
      _id: '$category',
      // 让输出的每组记录有一个 avgSales 字段，其值是组内所有记录的 sales 字段的平均值
      avgSales: $.avg('$sales')
    })
    .end()
  console.log(res.data)
}
```
