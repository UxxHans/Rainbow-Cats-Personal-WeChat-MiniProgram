# 包升级

node-sdk 与 tcb-admin-node 目前在 云函数，文件存储，数据库功能上保持了一致，但是 node-sdk 为用户提供了更友好的开发体验，未来 node-sdk 将继续迭代支持新特性，而 tcb-admin-node 会处于维护阶段，不会新增特性。

-   1. 支持[批量插入](./database/database.md#add)，[更新/删除单文档(批量查询时)](./database/database.md#options)
-   2. 业务错误码 throw 抛出，携带报错堆栈信息，方便定位问题
-   3. [部分接口支持超时时间设置](#自定义超时时间)
-   4. [云函数中使用当前环境](./env.md#SYMBOL_CURRENT_ENV)
-   5. 更好的支持 TypeScript

# 如何从 tcb-admin-node 迁移至 @cloudbase/node-sdk ？

## sdk 初始化方式变动

示例如下:

-   使用 tcb-admin-node 支持两种初始化方式

```javascript
// 方式一 使用tcb对象调用api
const tcb = require('tcb-admin-node')
tcb.init({ env: 'xxx' })
const db = tcb.database()
const result = await db
    .collection('coll')
    .where({})
    .get()

// 方式二 使用tcb.init() 得到的对象调用api
const tcb = require('tcb-admin-node')
const app = tcb.init({ env: 'xxx' })
const db = app.database()
const result = await db
    .collection('coll')
    .where({})
    .get()
```

-   使用 node-sdk 只支持 init 初始化实例

```javascript
// 只支持 使用tcb.init() 得到的对象调用api，方式一(使用require的对象直接调用api)被废弃

// database
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({ env: 'xxx' })
const db = app.database()

const result = await db
    .collection('coll')
    .where({})
    .get()

// function
const result = await app.callFunction({
    name: 'test',
    data: { a: 1 }
})

// storage
const result = await app.uploadFile({
    cloudPath: 'a|b测试.jpeg',
    fileContent
})
```

> 实例必须由 init 方法生成，然后由实例调用 api 方法，多次 init 将会得到多个不同实例

> ⚠️ 使用 node-sdk 库时，请务必使用 init 方法初始化的实例 来调用 api，否则会导致报错

## 自定义超时时间

数据库相关

示例如下:

```javascript
// database
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({ env: 'xxx' })
const db = app.database()

const queryDocumentOpts = {
    timeout: 5000
}
// 举例:查询文档
const result = await db
    .collection('coll')
    .where({})
    .options({ timeout: 10000 })
    .get()
```

函数相关

```javascript
// function
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({ env: 'xxx' })

const functionOpts = {
    timeout: 5000
}
const result = await app.callFunction(
    {
        name: 'test',
        data: { a: 1 }
    },
    functionOpts
)
```

存储相关

```javascript
// storage  上传文件
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({ env: 'xxx' })

const uploadFileOpts = {
    timeout: 5000
}
const result = await app.uploadFile(
    {
        cloudPath: 'a|b测试.jpeg',
        fileContent
    },
    uploadFileOpts
)
```

其他文件存储接口的自定义超时设置请参考[文件存储接口详细文档](./storage.md)
