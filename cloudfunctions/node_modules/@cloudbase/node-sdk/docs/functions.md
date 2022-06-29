# 云函数

## callFunction

#### 1. 接口描述

接口功能：执行云函数

接口声明：`callFunction(object: IFunctionParams, opts: Object): Promise<Object>`

#### 2. 输入参数

| 字段   | 类型            | 必填 | 说明                                                         |
| ------ | --------------- | ---- | ------------------------------------------------------------ |
| object | IFunctionParams | 是   | 云函数调用请求参数                                           |
| opts   | Object          | 否   | 自定义配置，目前支持 SDK 请求超时时间设置，{timeout: number} |

##### IFunctionParams

| 字段  | 类型   | 必填 | 说明       |
| ---- | ------ | ---- | ---------- |
| name | string | 是   | 云函数名称 |
| data | object | 否   | 云函数参数 |
| qualifier | string | 否   | 云函数版本标识：`$LATEST`(最新版本) `1` `2` `3`，缺省时按平台配置流量比例分配流量|

#### 3. 返回结果

| 字段      | 类型   | 必填 | 说明                     |
| --------- | ------ | ---- | ------------------------ |
| code      | string | 否   | 状态码，操作成功则不返回 |
| message   | string | 否   | 错误描述                 |
| result    | object | 否   | 云函数执行结果           |
| requestId | string | 否   | 请求序列号，用于错误排查 |

#### 4. 示例代码

```javascript
// 云函数环境下示例代码

// 初始化
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

exports.main = async (event, context) => {
  const res = await app.callFunction({
    name: 'test',
    data: { a: 1 }
  })
  console.log(res) // 打印函数调用结果

  const res1 = await app.callFunction(
    {
      name: 'test',
      data: { a: 1 }
    },
    {
      timeout: 5000
    }
  )
  console.log(res1)
}
```
