# 介绍

Cloudbase Server Node.js SDK 让你可以在服务端（如腾讯云云函数或 云主机 等）使用 Node.js 服务访问 TCB 的的服务，如云函数调用，文件上传下载，数据库集合文档操作等，方便快速搭建应用。

需要 Node.js v8.9 及以上版本。

> ⚠️ 当你计划在项目中使用 @cloudbase/node-sdk 替代 tcb-admin-node 时，请务必阅读[迁移文档](./packageUpgrade.md)

## 安装

Cloudbase Server Node.js SDK 可以通过 npm 安装：

```bash
npm install --save @cloudbase/node-sdk
```

## 使用示例

要在你的代码内使用该模块：

```js
const tcb = require('@cloudbase/node-sdk')
```

或

```typescript
import tcb from '@cloudbase/node-sdk'
```
