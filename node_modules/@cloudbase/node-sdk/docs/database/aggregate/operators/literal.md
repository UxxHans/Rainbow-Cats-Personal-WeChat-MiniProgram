# db.command.aggregate.literal

### 1. 操作符描述

功能：直接返回一个值的字面量，不经过任何解析和处理。

声明：`literal(<值>)`

### 2. 操作符参数

| 字段 | 类型 | 必填 | 说明                                                                                              |
| ---- | ---- | ---- | ------------------------------------------------------------------------------------------------- |
| -    | any  | 是   | 如果 `<值>` 是一个表达式，那么 `literal` **不会**解析或者计算这个表达式，而是直接返回这个表达式。 |

### 3. 示例代码

比如我们有一个 `items` 集合，其中数据如下：

```json
{ "_id": "0", "price": "$1" }
{ "_id": "1", "price": "$5.60" }
{ "_id": "2", "price": "$8.90" }
```

#### 以字面量的形式使用 \$

下面的代码使用 `literal`，生成了一个新的字段 `isOneDollar`，表示 `price` 字段是否严格等于 `"$1"`。

注意：我们这里无法使用 `eq(['$price', '$1'])`，因为 `"$1"` 是一个表达式，代表 `"1"` 字段对应的值，而不是字符串字面量 `"$1"`。

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('items')
    .aggregate()
    .project({
      isOneDollar: $.eq(['$price', $.literal('$1')])
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "_id": "0", "isOneDollar": true }
{ "_id": "1", "isOneDollar": false }
{ "_id": "2", "isOneDollar": false }
```

#### 投影一个字段，对应的值为 1

下面的代码使用 `literal`，投影了一个新的字段 `amount`，其值为 `1`。

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('items')
    .aggregate()
    .project({
      price: 1,
      amount: $.literal(1)
    })
    .end()
  console.log(res.data)
}
```

输出如下：

```json
{ "_id": "0", "price": "$1", "amount": 1 }
{ "_id": "1", "price": "$5.60", "amount": 1 }
{ "_id": "2", "price": "$8.90", "amount": 1 }
```
