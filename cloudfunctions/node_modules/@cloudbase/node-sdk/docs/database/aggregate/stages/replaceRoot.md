# Aggregate.replaceRoot

### 1. 接口描述

功能: 聚合阶段。指定一个已有字段作为输出的根节点，也可以指定一个计算出的新字段作为根节点。

声明: `replaceRoot({ newRoot: <表达式> })`

### 2. 输入参数

| 参数    | 类型                                   | 必填 | 说明             |
| ------- | -------------------------------------- | ---- | ---------------- |
| newRoot | [Aggregate](../aggregate.md) or Object | 是   | 两种格式详述如下 |

表达式格式如下：

| 格式     | 说明                                                       |
| -------- | ---------------------------------------------------------- |
| <字段名> | 指定一个已有字段作为输出的根节点（_如果字段不存在则报错_） |
| <对象>   | 计算一个新字段，并且把这个新字段作为根节点                 |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

#### 使用已有字段作为根节点

假设我们有一个 `schools` 集合，内容如下：

```json
{
  "_id": 1,
  "name": "SFLS",
  "teachers": {
    "chinese": 22,
    "math": 18,
    "english": 21,
    "other": 123
  }
}
```

下面的代码使用 `replaceRoot`，把 `teachers` 字段作为根节点输出：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('schools')
    .aggregate()
    .replaceRoot({
      newRoot: '$teachers'
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{
  "chinese": 22,
  "math": 18,
  "english": 21,
  "other": 123
}
```

#### 使用计算出的新字段作为根节点

假设我们有一个 `roles` 集合，内容如下：

```json
{ "_id": 1, "first_name": "四郎", "last_name": "黄" }
{ "_id": 2, "first_name": "邦德", "last_name": "马" }
{ "_id": 3, "first_name": "牧之", "last_name": "张" }
```

下面的代码使用 `replaceRoot`，把 `first_name` 和 `last_name` 拼在一起：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum, concat } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('roles')
    .aggregate()
    .replaceRoot({
      newRoot: {
        full_name: concat(['$last_name', '$first_name'])
      }
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "full_name": "黄四郎" }
{ "full_name": "马邦德" }
{ "full_name": "张牧之" }
```
