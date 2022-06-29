# Aggregate.unwind

### 1. 接口描述

功能: 使用指定的数组字段中的每个元素，对文档进行拆分。拆分后，文档会从一个变为一个或多个，分别对应数组的每个元素。

声明: 两种形式

- 参数是一个字段名

`unwind(<字段名>)`

- 参数是一个对象

`unwind({ path: <字段名>, includeArrayIndex: <string>, preserveNullAndEmptyArrays: <boolean> })`

### 2. 输入参数

| 参数                       | 类型    | 必填 | 说明                                                                                                                                                            |
| -------------------------- | ------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| path                       | string  | 是   | 想要拆分的数组的字段名，需要以 `$` 开头。                                                                                                                       |
| includeArrayIndex          | string  | 否   | 可选项，传入一个新的字段名，数组索引会保存在这个新的字段上。新的字段名不能以 `$` 开头。                                                                         |
| preserveNullAndEmptyArrays | boolean | 是   | 如果为 `true`，那么在 `path` 对应的字段为 `null`、空数组或者这个字段不存在时，依然会输出这个文档；如果为 `false`，`unwind` 将不会输出这些文档。默认为 `false`。 |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

#### 拆分数组

假设我们有一个 `products` 集合，包含数据如下：

```json
{ "_id": "1", "product": "tshirt", "size": ["S", "M", "L"] }
{ "_id": "2", "product": "pants", "size": [] }
{ "_id": "3", "product": "socks", "size": null }
{ "_id": "4", "product": "trousers", "size": ["S"] }
{ "_id": "5", "product": "sweater", "size": ["M", "L"] }
```

我们根据 `size` 字段对这些文档进行拆分

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()

exports.main = async (event, context) => {
  const res = await db
    .collection('products')
    .aggregate()
    .unwind('$size')
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "_id": "1", "product": "tshirt", "size": "S" }
{ "_id": "1", "product": "tshirt", "size": "M" }
{ "_id": "1", "product": "tshirt", "size": "L" }
{ "_id": "4", "product": "trousers", "size": "S" }
{ "_id": "5", "product": "sweater", "size": "M" }
{ "_id": "5", "product": "sweater", "size": "L" }
```

#### 拆分后，保留原数组的索引

我们根据 `size` 字段对文档进行拆分后，想要保留原数组索引在新的 `index` 字段中。

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()

exports.main = async (event, context) => {
  const res = await db
    .collection('products')
    .aggregate()
    .unwind({
      path: '$size',
      includeArrayIndex: 'index'
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "_id": "1", "product": "tshirt", "size": "S", "index": 0 }
{ "_id": "1", "product": "tshirt", "size": "M", "index": 1 }
{ "_id": "1", "product": "tshirt", "size": "L", "index": 2 }
{ "_id": "4", "product": "trousers", "size": "S", "index": 0 }
{ "_id": "5", "product": "sweater", "size": "M", "index": 0 }
{ "_id": "5", "product": "sweater", "size": "L", "index": 1 }
```

#### 保留字段为空的文档

注意到我们的集合中有两行特殊的空值数据：

```json
...
{ "_id": "2", "product": "pants", "size": [] }
{ "_id": "3", "product": "socks", "size": null }
...
```

如果想要在输出中保留 `size` 为空数组、null，或者 `size` 字段不存在的文档，可以使用 `preserveNullAndEmptyArrays` 参数

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()

exports.main = async (event, context) => {
  const res = await db
    .collection('products')
    .aggregate()
    .unwind({
      path: '$size',
      preserveNullAndEmptyArrays: true
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "_id": "1", "product": "tshirt", "size": "S" }
{ "_id": "1", "product": "tshirt", "size": "M" }
{ "_id": "1", "product": "tshirt", "size": "L" }
{ "_id": "2", "product": "pants", "size": null }
{ "_id": "3", "product": "socks", "size": null }
{ "_id": "4", "product": "trousers", "size": "S" }
{ "_id": "5", "product": "sweater", "size": "M" }
{ "_id": "5", "product": "sweater", "size": "L" }
```
