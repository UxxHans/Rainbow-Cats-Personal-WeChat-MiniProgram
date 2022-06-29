# 环境

## SYMBOL_CURRENT_ENV

字段说明: 初始化时使用该字段，可指定请求当前云函数的环境

#### 示例代码

```js
// 云函数环境下示例代码
const tcb = require('@cloudbase/node-sdk')
// 取当前云函数的环境初始化
const app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV })

exports.main = async (event, context) => {
    /**
     * @returns string
     */
    // todo
}
```

## parseContext

#### 1. 接口描述

接口功能：解析云函数环境下的环境变量（参数取用 云函数入口参数 context 即可）

接口声明：`parseContext(context): Object`

#### 2. 输入参数

| 字段               | 类型   | 必填 | 说明           |
| ------------------ | ------ | ---- | -------------- |
| memory_limit_in_mb | Number | 是   | 云函数内存限制 |
| time_limit_in_ms   | Number | 是   | 运行时间限制   |
| request_id         | String | 是   | 请求 ID        |
| environ            | String | 是   | 环境变量字符串 |
| function_version   | String | 是   | 云函数版本     |
| function_name      | String | 是   | 云函数名       |
| namespace          | String | 是   | 命名空间       |

#### 3. 返回结果

| 字段               | 类型   | 必填 | 说明                                       |
| ------------------ | ------ | ---- | ------------------------------------------ |
| memory_limit_in_mb | Number | 是   | 云函数内存限制                             |
| time_limit_in_ms   | Number | 是   | 运行时间限制                               |
| request_id         | String | 是   | 请求 ID                                    |
| environ            | Object | 是   | 环境变量对象(含用户设置的自定义环境变量值) |
| function_version   | String | 是   | 云函数版本                                 |
| function_name      | String | 是   | 云函数名                                   |
| namespace          | String | 是   | 命名空间                                   |

#### 4. 示例代码

```javascript
const tcb = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
    const envObj = tcb.parseContext(context) // context 参数 取自云函数入口函数handler的context对象
    console.log(envObj) // 打印云函数环境变量
}
```
