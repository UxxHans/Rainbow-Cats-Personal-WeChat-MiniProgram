# Aggregate.sort

### 1. 接口描述

功能: 聚合阶段。`sort` 根据指定的字段，对输入的文档进行排序。

声明: `sort({ key1: sortRule1, key2: sortRule2, })`

### 2. 输入参数

| 参数 | 类型   | 必填 | 说明                                                                     |
| ---- | ------ | ---- | ------------------------------------------------------------------------ |
| key  | number | 是   | 值为排序规则，`1` 代表升序排列（从小到大), `-1` 代表降序排列（从大到小） |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

#### 升序/降序排列

假设我们有集合 `articles`，其中包含数据如下：

```json
{ "_id": "1", "author": "stark",  "score": 80, "age": 18 }
{ "_id": "2", "author": "bob",    "score": 60, "age": 18 }
{ "_id": "3", "author": "li",     "score": 55, "age": 19 }
{ "_id": "4", "author": "jimmy",  "score": 60, "age": 22 }
{ "_id": "5", "author": "justan", "score": 95, "age": 33 }
```

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum, concat } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('articles')
    .aggregate()
    .sort({
      age: -1,
      score: -1
    })
    .end()
  console.log(res.data)
}
```

上面的代码在 `students` 集合中进行聚合搜索，并且将结果排序，首先根据 `age` 字段降序排列，然后再根据 `score` 字段进行降序排列。

输出结果如下：

```json
{ "_id": "5", "author": "justan", "score": 95, "age": 33 }
{ "_id": "4", "author": "jimmy",  "score": 60, "age": 22 }
{ "_id": "3", "author": "li",     "score": 55, "age": 19 }
{ "_id": "1", "author": "stark",  "score": 80, "age": 18 }
{ "_id": "2", "author": "bob",    "score": 60, "age": 18 }
```
