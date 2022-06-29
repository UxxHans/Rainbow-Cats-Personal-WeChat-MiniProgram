# Aggregate.project

### 1. 接口描述

功能: 聚合阶段。把指定的字段传递给下一个流水线，指定的字段可以是某个已经存在的字段，也可以是计算出来的新字段。

声明: `project({ <字段>:<表达式> })`

### 2. 输入参数

字段表达式可以有以下格式：

| 格式                     | 说明                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| <字段>: <`1` 或 `true`>  | 指定包含某个已有字段                                                                                |
| \_id: <`0` 或 `false`>   | 舍弃 \_id 字段                                                                                      |
| <字段>: <表达式>         | 加入一个新字段，或者重置某个已有字段                                                                |
| <字段>: <`0` 或 `false`> | 舍弃某个字段（_如果你指定舍弃了某个非 \_id 字段，那么在此次 `project` 中，你不能再使用其它表达式_） |

### 说明

#### 指定包含字段

- `_id` 字段是默认包含在输出中的，除此之外其他任何字段，如果想要在输出中体现的话，必须在 `project` 中指定；
- 如果指定包含一个尚不存在的字段，那么 `project` 会忽略这个字段，不会加入到输出的文档中；

#### 指定排除字段

- 如果你在 `project` 中指定排除某个字段，那么其它字段都会体现在输出中；
- 如果指定排除的是非 `_id` 字段，那么在本次 `project` 中，不能再使用其它表达式；

#### 加入新的字段或重置某个已有字段

你可以使用一些特殊的表达式加入新的字段，或重置某个已有字段。

#### 多层嵌套的字段

有时有些字段处于多层嵌套的底层，我们可以使用**点记法**：

```js
"contact.phone.number": <1 or 0 or 表达式>
```

也可以直接使用嵌套的格式：

```js
contact: { phone: { number: <1 or 0 or 表达式> } }
```

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

假设我们有一个 `articles` 集合，其中含有以下文档：

```json
{
  "_id": 666,
  "title": "This is title",
  "author": "Nobody",
  "isbn": "123456789",
  "introduction": "......"
}
```

#### 指定包含某些字段

下面的代码使用 `project`，让输出只包含 `_id`、`title` 和 `author` 字段：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('articles')
    .aggregate()
    .project({
      title: 1,
      author: 1
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```js
{ "_id" : 666, "title" : "This is title", "author" : "Nobody" }
```

#### 去除输出中的 \_id 字段

`_id` 是默认包含在输出中的，如果不想要它，可以指定去除它：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('articles')
    .aggregate()
    .project({
      _id: 0, // 指定去除 _id 字段
      title: 1,
      author: 1
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```js
{ "title" : "This is title", "author" : "Nobody" }
```

#### 去除某个非 \_id 字段

我们还可以指定在输出中去掉某个非 `_id` 字段，这样其它字段都会被输出：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('articles')
    .aggregate()
    .project({
      isbn: 0 // 指定去除 isbn 字段
    })
    .end()
  console.log(res.data)
}
```

输出如下，相比输入，没有了 `isbn` 字段：

```json
{
  "_id": 666,
  "title": "This is title",
  "author": "Nobody",
  "introduction": "......"
}
```

#### 加入计算出的新字段

假设我们有一个 `students` 集合，其中包含以下文档：

```json
{
  "_id": 1,
  "name": "小明",
  "scores": {
    "chinese": 80,
    "math": 90,
    "english": 70
  }
}
```

下面的代码，我们使用 `project`，在输出中加入了一个新的字段 `totalScore`：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('students')
    .aggregate()
    .project({
      _id: 0,
      name: 1,
      totalScore: sum(['$scores.chinese', '$scores.math', '$scores.english'])
    })
    .end()
  console.log(res.data)
}
```

输出为：

```json
{ "name": "小明", "totalScore": 240 }
```

#### 加入新的数组字段

假设我们有一个 `points` 集合，包含以下文档：

```json
{ "_id": 1, "x": 1, "y": 1 }
{ "_id": 2, "x": 2, "y": 2 }
{ "_id": 3, "x": 3, "y": 3 }
```

下面的代码，我们使用 `project`，把 `x` 和 `y` 字段，放入到一个新的数组字段 `coordinate` 中：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const { gt, sum } = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('points')
    .aggregate()
    .project({
      coordinate: ['$x', '$y']
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "_id": 1, "coordinate": [1, 1] }
{ "_id": 2, "coordinate": [2, 2] }
{ "_id": 3, "coordinate": [3, 3] }
```
