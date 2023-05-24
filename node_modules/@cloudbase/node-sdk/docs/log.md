# 打印日志

## log

#### 1. 接口描述

接口功能：按 log 级别上报日志

接口声明：`log(data: Object): void`

#### 2. 输入参数

| 字段 | 类型   | 必填 | 说明           |
| ---- | ------ | ---- | -------------- |
| -    | Object | 是   | 打印的日志对象 |

#### 3. 返回结果

无

#### 4. 示例代码

```javascript
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init()
let logMsg = { name: 'luke', age: '25' } // msg必须为对象

exports.main = async (event, context) => {
  // 输出log级别
  app.logger().log(logMsg)
}
```

## warn

#### 1. 接口描述

接口功能：按 warn 级别上报日志

接口声明：`warn(data: Object): void`

#### 2. 输入参数

| 字段 | 类型   | 必填 | 说明           |
| ---- | ------ | ---- | -------------- |
| -    | Object | 是   | 打印的日志对象 |

#### 3. 返回结果

无

#### 4. 示例代码

```javascript
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init()
let logMsg = { name: 'luke', age: '25' } // msg必须为对象

exports.main = async (event, context) => {
  // 输出warn级别
  app.logger().warn(logMsg)
}
```

## error

#### 1. 接口描述

接口功能：按 error 级别上报日志

接口声明：`error(data: Object): void`

#### 2. 输入参数

| 字段 | 类型   | 必填 | 说明           |
| ---- | ------ | ---- | -------------- |
| -    | Object | 是   | 打印的日志对象 |

#### 3. 返回结果

无

#### 4. 示例代码

```javascript
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init()
let logMsg = { name: 'luke', age: '25' } // msg必须为对象

exports.main = async (event, context) => {
  // 输出error级别
  app.logger().error(logMsg)
}
```

## info

#### 1. 接口描述

接口功能：按 info 级别上报日志

接口声明：`info(data: Object): void`

#### 2. 输入参数

| 字段 | 类型   | 必填 | 说明           |
| ---- | ------ | ---- | -------------- |
| -    | Object | 是   | 打印的日志对象 |

#### 3. 返回结果

无

#### 4. 示例代码

```javascript
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init()
let logMsg = { name: 'luke', age: '25' } // msg必须为对象

exports.main = async (event, context) => {
  // 输出info级别
  app.logger().info(logMsg)
}
```
