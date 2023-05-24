# Aggregate.lookup

### 1. 接口描述

功能: 聚合阶段。联表查询。与同个数据库下的一个指定的集合做 left outer join(左外连接)。对该阶段的每一个输入记录，lookup 会在该记录中增加一个数组字段，该数组是被联表中满足匹配条件的记录列表。lookup 会将连接后的结果输出给下个阶段。

声明: `limit(object)`

两种形式

1. 相等匹配

将输入记录的一个字段和被连接集合的一个字段进行相等匹配时，采用以下定义：

```
lookup({
  from: <要连接的集合名>,
  localField: <输入记录的要进行相等匹配的字段>,
  foreignField: <被连接集合的要进行相等匹配的字段>,
  as: <输出的数组字段名>
})
```

2. 自定义连接条件、拼接子查询

如果需要指定除相等匹配之外的连接条件，或指定多个相等匹配条件，或需要拼接被连接集合的子查询结果，那可以使用如下定义：

```
lookup({
  from: <要连接的集合名>,
  let: { <变量1>: <表达式1>, ..., <变量n>: <表达式n> },
  pipeline: [ <在要连接的集合上进行的流水线操作> ],
  as: <输出的数组字段名>
})

```

### 2. 输入参数

1. 相等匹配

| 参数         | 类型   | 必填 | 说明                                                                                                                                                    |
| ------------ | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| from         | string | 是   | 要进行连接的另外一个集合的名字                                                                                                                          |
| localField   | string | 是   | 当前流水线的输入记录的字段名，该字段将被用于与 from 指定的集合的 foreignField 进行相等匹配。如果输入记录中没有该字段，则该字段的值在匹配时会被视作 null |
| foreignField | string | 是   | 被连接集合的字段名，该字段会被用于与 localField 进行相等匹配。如果被连接集合的记录中没有该字段，该字段的值将在匹配时被视作 null                         |
| as           | string | 是   | 指定连接匹配出的记录列表要存放的字段名，这个数组包含的是匹配出的来自 from 集合的记录。如果输入记录中本来就已有该字段，则该字段会被覆写                  |
|  |

- 操作等价于以下伪 SQL 操作：

```SQL
SELECT *, <output array field>
FROM collection
WHERE <output array field> IN (SELECT *
                               FROM <collection to join>
                               WHERE <foreignField>= <collection.localField>);
```

2. 自定义连接条件、拼接子查询

| 参数     | 类型   | 必填 | 说明                                                                                                                                                                                                                                                                                                  |
| -------- | ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| from     | string | 是   | 要进行连接的另外一个集合的名字                                                                                                                                                                                                                                                                        |
| let      | string | 否   | 指定在 pipeline 中可以使用的变量，变量的值可以引用输入记录的字段，比如 let: { userName: '$name' } 就代表将输入记录的 name 字段作为变量 userName 的值。在 pipeline 中无法直接访问输入记录的字段，必须通过 let 定义之后才能访问，访问的方式是在 expr 操作符中用 $$变量名 的方式访问，比如 $\$userName。 |
| pipeline | any    | 是   | 指定要在被连接集合中运行的聚合操作。如果要返回整个集合，则该字段取值空数组 []。在 pipeline 中无法直接访问输入记录的字段，必须通过 let 定义之后才能访问，访问的方式是在 expr 操作符中用 $$变量名 的方式访问，比如 $$userName。                                                                         |
| as       | string | 是   | 指定连接匹配出的记录列表要存放的字段名，这个数组包含的是匹配出的来自 from 集合的记录。如果输入记录中本来就已有该字段，则该字段会被覆写                                                                                                                                                                |
|  |

- 操作等价于以下伪 SQL 操作：

```SQL
SELECT *, <output array field>
FROM collection
WHERE <output array field> IN (SELECT <documents as determined from the pipeline>
                               FROM <collection to join>
                               WHERE <pipeline> );
```

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

#### 指定一个相等匹配条件

假设 orders 集合有以下记录：

```
[
  {"_id":4,"book":"novel 1","price":30,"quantity":2},
  {"_id":5,"book":"science 1","price":20,"quantity":1},
  {"_id":6}
]
```

books 集合有以下记录：

```
[
  {"_id":"book1","author":"author 1","category":"novel","stock":10,"time":1564456048486,"title":"novel 1"},
  {"_id":"book3","author":"author 3","category":"science","stock":30,"title":"science 1"},
  {"_id":"book4","author":"author 3","category":"science","stock":40,"title":"science 2"},
  {"_id":"book2","author":"author 2","category":"novel","stock":20,"title":"novel 2"},
  {"_id":"book5","author":"author 4","category":"science","stock":50,"title":null},
  {"_id":"book6","author":"author 5","category":"novel","stock":"60"}
]
```

以下聚合操作可以通过一个相等匹配条件连接 orders 和 books 集合，匹配的字段是 orders 集合的 book 字段和 books 集合的 title 字段：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('orders')
    .aggregate()
    .lookup({
      from: 'books',
      localField: 'book',
      foreignField: 'title',
      as: 'bookList'
    })
    .end()
  console.log(res.data)
}
```

结果：

```
[
  {
    "_id": 4,
    "book": "novel 1",
    "price": 30,
    "quantity": 2,
    "bookList": [
      {
        "_id": "book1",
        "title": "novel 1",
        "author": "author 1",
        "category": "novel",
        "stock": 10
      }
    ]
  },
  {
    "_id": 5,
    "book": "science 1",
    "price": 20,
    "quantity": 1,
    "bookList": [
      {
        "_id": "book3",
        "category": "science",
        "title": "science 1",
        "author": "author 3",
        "stock": 30
      }
    ]
  },
  {
    "_id": 6,
    "bookList": [
      {
        "_id": "book5",
        "category": "science",
        "author": "author 4",
        "stock": 50,
        "title": null
      },
      {
        "_id": "book6",
        "author": "author 5",
        "stock": "60",
        "category": "novel"
      }
    ]
  }
]
```

#### 对数组字段应用相等匹配

假设 authors 集合有以下记录：

```
[
  {"_id": 1, "name": "author 1", "intro": "Two-time best-selling sci-fiction novelist"},
  {"_id": 3, "name": "author 3", "intro": "UCB assistant professor"},
  {"_id": 4, "name": "author 4", "intro": "major in CS"}
]
```

books 集合有以下记录：

```
[
  {"_id":"book1","authors":["author 1"],"category":"novel","stock":10,"time":1564456048486,"title":"novel 1"},
  {"_id":"book3","authors":["author 3", "author 4"],"category":"science","stock":30,"title":"science 1"},
  {"_id":"book4","authors":["author 3"],"category":"science","stock":40,"title":"science 2"}
]
```

以下操作获取作者信息及他们分别发表的书籍，使用了 lookup 操作匹配 authors 集合的 name 字段和 books 集合的 authors 数组字段：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('authors')
    .aggregate()
    .lookup({
      from: 'books',
      localField: 'name',
      foreignField: 'authors',
      as: 'publishedBooks'
    })
    .end()
  console.log(res.data)
}
```

结果

```
[
  {
    "_id": 1,
    "intro": "Two-time best-selling sci-fiction novelist",
    "name": "author 1",
    "publishedBooks": [
      {
        "_id": "book1",
        "title": "novel 1",
        "category": "novel",
        "stock": 10,
        "authors": [
          "author 1"
        ]
      }
    ]
  },
  {
    "_id": 3,
    "name": "author 3",
    "intro": "UCB assistant professor",
    "publishedBooks": [
      {
        "_id": "book3",
        "category": "science",
        "title": "science 1",
        "stock": 30,
        "authors": [
          "author 3",
          "author 4"
        ]
      },
      {
        "_id": "book4",
        "title": "science 2",
        "category": "science",
        "stock": 40,
        "authors": [
          "author 3"
        ]
      }
    ]
  },
  {
    "_id": 4,
    "intro": "major in CS",
    "name": "author 4",
    "publishedBooks": [
      {
        "_id": "book3",
        "category": "science",
        "title": "science 1",
        "stock": 30,
        "authors": [
          "author 3",
          "author 4"
        ]
      }
    ]
  }
]
```

#### 组合 mergeObjects 应用相等匹配

假设 orders 集合有以下记录：

```
[
  {"_id":4,"book":"novel 1","price":30,"quantity":2},
  {"_id":5,"book":"science 1","price":20,"quantity":1},
  {"_id":6}
]
```

books 集合有以下记录：

```
[
  {"_id":"book1","author":"author 1","category":"novel","stock":10,"time":1564456048486,"title":"novel 1"},
  {"_id":"book3","author":"author 3","category":"science","stock":30,"title":"science 1"},
  {"_id":"book4","author":"author 3","category":"science","stock":40,"title":"science 2"},
  {"_id":"book2","author":"author 2","category":"novel","stock":20,"title":"novel 2"},
  {"_id":"book5","author":"author 4","category":"science","stock":50,"title":null},
  {"_id":"book6","author":"author 5","category":"novel","stock":"60"}
]
```

以下操作匹配 orders 的 book 字段和 books 的 title 字段，并将 books 匹配结果直接 merge 到 orders 记录中。

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('orders')
    .aggregate()
    .lookup({
      from: 'books',
      localField: 'book',
      foreignField: 'title',
      as: 'bookList'
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$bookList', 0]), '$$ROOT'])
    })
    .project({
      bookList: 0
    })
    .end()
  console.log(res.data)
}
```

结果

```
[
  {
    "_id": 4,
    "title": "novel 1",
    "author": "author 1",
    "category": "novel",
    "stock": 10,
    "book": "novel 1",
    "price": 30,
    "quantity": 2
  },
  {
    "_id": 5,
    "category": "science",
    "title": "science 1",
    "author": "author 3",
    "stock": 30,
    "book": "science 1",
    "price": 20,
    "quantity": 1
  },
  {
    "_id": 6,
    "category": "science",
    "author": "author 4",
    "stock": 50,
    "title": null
  }
]
```

#### 指定多个连接条件

假设 orders 集合有以下记录：

```
[
  {"_id":4,"book":"novel 1","price":300,"quantity":20},
  {"_id":5,"book":"science 1","price":20,"quantity":1}
]
```

books 集合有以下记录：

```
[
  {"_id":"book1","author":"author 1","category":"novel","stock":10,"time":1564456048486,"title":"novel 1"},
  {"_id":"book3","author":"author 3","category":"science","stock":30,"title":"science 1"}
]
```

以下操作连接 orders 和 books 集合，要求两个条件：

orders 的 book 字段与 books 的 title 字段相等
orders 的 quantity 字段大于或等于 books 的 stock 字段

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('orders')
    .aggregate()
    .lookup({
      from: 'books',
      let: {
        order_book: '$book',
        order_quantity: '$quantity'
      },
      pipeline: $.pipeline()
        .match(
          _.expr(
            $.and([
              $.eq(['$title', '$$order_book']),
              $.gte(['$stock', '$$order_quantity'])
            ])
          )
        )
        .project({
          _id: 0,
          title: 1,
          author: 1,
          stock: 1
        })
        .done(),
      as: 'bookList'
    })
    .end()
  console.log(res.data)
}
```

结果：

[
{
"\_id": 4,
"book": "novel 1",
"price": 300,
"quantity": 20,
"bookList": []
},
{
"\_id": 5,
"book": "science 1",
"price": 20,
"quantity": 1,
"bookList": [
{
"title": "science 1",
"author": "author 3",
"stock": 30
}
]
}
]

#### 拼接被连接集合的子查询

假设 orders 集合有以下记录：

```
[
  {"_id":4,"book":"novel 1","price":30,"quantity":2},
  {"_id":5,"book":"science 1","price":20,"quantity":1}
]
```

books 集合有以下记录：

```
[
  {"_id":"book1","author":"author 1","category":"novel","stock":10,"time":1564456048486,"title":"novel 1"},
  {"_id":"book3","author":"author 3","category":"science","stock":30,"title":"science 1"},
  {"_id":"book4","author":"author 3","category":"science","stock":40,"title":"science 2"}
]
```

在每条输出记录上加上一个数组字段，该数组字段的值是对 books 集合的一个查询语句的结果：

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('orders')
    .aggregate()
    .lookup({
      from: 'books',
      let: {
        order_book: '$book',
        order_quantity: '$quantity'
      },
      pipeline: $.pipeline()
        .match({
          author: 'author 3'
        })
        .project({
          _id: 0,
          title: 1,
          author: 1,
          stock: 1
        })
        .done(),
      as: 'bookList'
    })
    .end()
  console.log(res.data)
}
```

结果

```
[
  {
    "_id": 4,
    "book": "novel 1",
    "price": 30,
    "quantity": 20,
    "bookList": [
      {
        "title": "science 1",
        "author": "author 3",
        "stock": 30
      },
      {
        "title": "science 2",
        "author": "author 3",
        "stock": 40
      }
    ]
  },
  {
    "_id": 5,
    "book": "science 1",
    "price": 20,
    "quantity": 1,
    "bookList": [
      {
        "title": "science 1",
        "author": "author 3",
        "stock": 30
      },
      {
        "title": "science 2",
        "author": "author 3",
        "stock": 40
      }
    ]
  }
]
```
