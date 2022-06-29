# Aggregate.sortByCount

### 1. 接口描述

功能: 根据传入的表达式，将传入的集合进行分组（`group`）。然后计算不同组的数量，并且将这些组按照它们的数量进行排序，返回排序后的结果。

声明: `sortByCount(<表达式>)`

### 2. 输入参数

| 参数 | 类型                         | 必填 | 说明                                                        |
| ---- | ---------------------------- | ---- | ----------------------------------------------------------- |
| -    | [Aggregate](../aggregate.md) | 是   | 表达式的形式是：`$ + 指定字段`。请注意：不要漏写 `$` 符号。 |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

#### 统计基础类型

假设集合 `passages` 的记录如下：

```
{ "category": "Web" }
{ "category": "Web" }
{ "category": "Life" }
```

下面的代码就可以统计文章的分类信息，并且计算每个分类的数量。即对 `category` 字段执行 `sortByCount` 聚合操作。

```javascript
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()

exports.main = async (event, context) => {
  const res = await db
    .collection('passages')
    .aggregate()
    .sortByCount('$category')
    .end()
  console.log(res.data)
}
```

返回的结果如下所示：`Web` 分类下有 2 篇文章，`Life` 分类下有 1 篇文章。

```
{ "_id": "Web", "count": 2 }
{ "_id": "Life", "count": 1 }
```

#### 解构数组类型

假设集合 `passages` 的记录如下：`tags` 字段对应的值是数组类型。

```
{ "tags": [ "JavaScript", "C#" ] }
{ "tags": [ "Go", "C#" ] }
{ "tags": [ "Go", "Python", "JavaScript" ] }
```

如何统计文章的标签信息，并且计算每个标签的数量？因为 `tags` 字段对应的数组，所以需要借助 `unwind` 操作解构 `tags` 字段，然后再调用 `sortByCount`。

下面的代码实现了这个功能：

```javascript
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()

exports.main = async (event, context) => {
  const res = await db
    .collection('passages')
    .aggregate()
    .unwind(`$tags`)
    .sortByCount(`$tags`)
    .end()
  console.log(res.data)
}
```

返回的结果如下所示：

```
{ "_id": "Go", "count": 2 }
{ "_id": "C#", "count": 2 }
{ "_id": "JavaScript", "count": 2 }
{ "_id": "Python", "count": 1 }
```
