# db.command.aggregate.add

### 1. 操作符描述

功能：将数字相加或将数字加在日期上。如果数组中的其中一个值是日期，那么其他值将被视为毫秒数加在该日期上。

声明：`db.command.aggregate.add([expression1, expression2, ...])`

### 2. 操作符参数

| 字段 | 类型                                        | 必填 | 说明                                                                                    |
| ---- | ------------------------------------------- | ---- | --------------------------------------------------------------------------------------- |
| -    | &lt;Array&gt;[Expression](../expression.md) | 是   | 字符串表达式可以是形如 `$ + 指定字段`，也可以是普通字符串。只要能够被解析成字符串即可。 |

### 3. 示例代码

假设集合 `staff` 有如下记录：

```
{ _id: 1, department: "x", sales: 5, engineer: 10, lastUpdate: ISODate("2019-05-01T00:00:00Z") }
{ _id: 2, department: "y", sales: 10, engineer: 20, lastUpdate: ISODate("2019-05-01T02:00:00Z") }
{ _id: 3, department: "z", sales: 20, engineer: 5, lastUpdate: ISODate("2019-05-02T03:00:00Z") }
```

#### 数字求和

可以用如下方式求得各个记录人数总数：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('staff')
    .aggregate()
    .project({
      department: 1,
      total: $.add(['$sales', '$engineer'])
    })
    .end()
  console.log(res.data) // 打印聚合结果
}
```

返回结果如下：

```
{ _id: 1, department: "x", total: 15 }
{ _id: 2, department: "y", total: 30 }
{ _id: 3, department: "z", total: 25 }
```

#### 增加日期值

如下操作可以获取各个记录的 `lastUpdate` 加一个小时之后的值：

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const res = await db
    .collection('staff')
    .aggregate()
    .project({
      department: 1,
      lastUpdate: $.add(['$lastUpdate', 60 * 60 * 1000])
    })
    .end()
  console.log(res.data) // 打印聚合结果
}
```

返回结果如下：

```
{ _id: 1, department: "x", lastUpdate: ISODate("2019-05-01T01:00:00Z") }
{ _id: 2, department: "y", lastUpdate: ISODate("2019-05-01T03:00:00Z") }
{ _id: 3, department: "z", lastUpdate: ISODate("2019-05-02T04:00:00Z") }
```
