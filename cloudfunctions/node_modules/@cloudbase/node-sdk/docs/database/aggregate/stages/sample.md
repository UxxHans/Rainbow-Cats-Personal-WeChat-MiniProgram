# Aggregate.sample

### 1. 接口描述

功能: 聚合阶段。随机从文档中选取指定数量的记录。

声明: `sample({ size: <正整数> })`

### 2. 输入参数

| 参数 | 类型   | 必填 | 说明                          |
| ---- | ------ | ---- | ----------------------------- |
| size | number | 是   | `size` 是正整数，否则会出错。 |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

假设文档 `users` 有以下记录：

```
{ "name": "a" }
{ "name": "b" }
```

#### 随机选取

如果现在进行抽奖活动，需要选出一名幸运用户。那么 `sample` 的调用方式如下：

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
    .sample({
      size: 1
    })
    .end()
  console.log(res.data)
}
```

返回了随机选中的一个用户对应的记录，结果如下：

```
{ "_id": "696529e4-7e82-4e7f-812e-5144714edff6", "name": "b" }
```
