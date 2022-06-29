# 数据库模块的测试目录

[TOC]

## 文件说明

```m
- unit                    // 单元测试文件夹
  - collection.test.ts    // 集合模块
  - db.test.test.ts       // 数据库模块
  - document.test.ts      // 文档模块
  - mock.ts               // 模拟数据
  - util.test.ts          // 工具模块
  - validate.test.ts      // 校验模块
- index.test.ts           // 集成测试
```

## 使用

具体用法可以参考`index.test.ts`

## 测试内容

- 访问变量
- 错误输入
- API接口

## 集成测试说明

### 主要方法

- 新建文档
  - db.collection().add()
  - db.collection().doc().set()
- 更新文档
  - db.collection().doc().set()
  - db.collection().doc().update()
- 查询文档
  - db.collection().get()
  - db.collection().where().get()
  - db.collection().orderBy().get()
  - db.collection().limit().get()
  - db.collection().skip().get()
- 删除文档
  - db.collection().doc().remove()

### 主要流程

- 查询并删除全部文档
- 新建几个文档
- 执行查询操作
- 执行更新操作
- 执行查询操作
- 查询并删除全部文档
- 查询是否全部清空
