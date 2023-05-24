# Aggregate.skip

### 1. 接口描述

功能: 聚合阶段。指定一个正整数，跳过对应数量的文档，输出剩下的文档。

声明: `skip(<正整数>)`

### 2. 输入参数

| 参数 | 类型   | 必填 | 说明                 |
| ---- | ------ | ---- | -------------------- |
| -    | number | 是   | 正整数，否则会出错。 |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

```javascript
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum, concat } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('users')
    .aggregate()
    .skip(5)
    .end()
  console.log(res.data)
}
```

这段代码会跳过查找到的**前 5 个**文档，并且把剩余的文档输出。
