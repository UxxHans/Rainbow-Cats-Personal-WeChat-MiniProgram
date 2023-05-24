# db.command.aggregate.addToSet

### 1. 操作符描述

功能：向数组中添加值，如果数组中已存在该值，不执行任何操作。它只能在 `group stage` 中使用。

声明：`db.command.aggregate.addToSet(expression)`

### 2. 操作符参数

| 字段 | 类型                           | 必填 | 说明                                                                                               |
| ---- | ------------------------------ | ---- | -------------------------------------------------------------------------------------------------- |
| -    | [Expression](../expression.md) | 是   | 字符串表达式是形如 `$ + 指定字段` 的字符串。如果指定字段的值是数组，那么整个数组会被当作一个元素。 |

### 3. 示例代码

假设集合 `passages` 的记录如下：

```json
{ "category": "web", "tags": [ "JavaScript", "CSS" ], "title": "title1" }
{ "category": "System", "tags": [ "C++", "C" ], "title": "title2" }
```

#### 非数组字段

每条记录的 `category` 对应值的类型是非数组，利用 `addToSet` 统计所有分类：

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('passages')
    .aggregate()
    .group({
      _id: null,
      categories: $.addToSet('$category')
    })
    .end()
  console.log(res.data)
}
```

返回的结果如下：

```json
{ "_id": null, "categories": ["System", "web"] }
```

#### 数组字段

每条记录的 `tags` 对应值的类型是数组，数组不会被自动展开：

```javascript
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('passages')
    .aggregate()
    .group({
      _id: null,
      tagsList: $.addToSet('$tags')
    })
    .end()
  console.log(res.data)
}
```

返回的结果如下：

```json
{
  "_id": null,
  "tagsList": [
    ["C++", "C"],
    ["JavaScript", "CSS"]
  ]
}
```
