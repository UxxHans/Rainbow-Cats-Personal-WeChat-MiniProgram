# Tencent Cloud Base(TCB) Admin Node.js SDK

![node (scoped)](https://img.shields.io/node/v/tcb-admin-node.svg)
[![NPM Version](https://img.shields.io/npm/v/tcb-admin-node.svg?style=flat)](https://www.npmjs.com/package/tcb-admin-node)
[![Deps](https://david-dm.org/TencentCloudBase/tcb-admin-node.svg)](https://david-dm.org/TencentCloudBase/tcb-admin-node)
[![Build Status](https://travis-ci.org/TencentCloudBase/tcb-admin-node.svg?branch=master)](https://travis-ci.org/TencentCloudBase/tcb-admin-node)
[![](https://img.shields.io/npm/dt/tcb-admin-node.svg)](https://www.npmjs.com/package/tcb-admin-node)


## 目录
* [介绍](#介绍)
* [安装](#安装)
* [文档](#文档)


## 介绍
TCB提供开发应用所需服务和基础设施。tcb admin Node.js SDK 让你可以在服务端（如腾讯云云函数或CVM等）使用Node.js服务访问TCB的的服务。

需要Node.js v8.0及以上版本。

## 安装
tcb admin Node.js SDK 可以通过`tcb-admin-node`来访问：
```base
npm install --save tcb-admin-node@latest
```

要在你的模块式使用模块可以
```js
var admin = require("tcb-admin-node");
```
或
```js
import * as admin from "tcb-admin-node";
```

## 文档
* [初始化](docs/initialization.md)
* [存储](docs/storage.md)
* [数据库](docs/database.md)
* [云函数](docs/functions.md)
* [鉴权](./docs/auth.md)
* [环境](./docs/env.md)

