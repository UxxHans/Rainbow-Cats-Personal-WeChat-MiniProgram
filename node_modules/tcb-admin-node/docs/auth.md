### 获取auth的引用

```js
const app = require('tcb-admin-node');
const auth = app.auth();
```

#### 获取用户信息

```js
const {
  openId, //微信openId，非微信授权登录则空
  appId, //微信appId，非微信授权登录则空
  uid, //用户唯一ID
  customUserId //开发者自定义的用户唯一id，非自定义登录则空
} = auth.getUserInfo()
```


#### 获取authContext信息

```js
const {
  uid, // tcb唯一Id
  loginType, // web端调用时才返回
  openId, // QQ小程序时，返回用户QQ小程序对应的openId
  appId // QQ小程序时，返回用户QQ小程序对应的小程序appId
} = await auth.getAuthContext(context)
```
`context`为取自云函数入口参数`context`

#### 获取客户端IP
```js
const ip = auth.getClientIP()
```

#### 获取自定义登录的登录凭据ticket

```js
const customUserId = '123456' // 开发者自定义的用户唯一id

const ticket = auth.createTicket(customUserId, {
  refresh: 3600 * 1000, // access_token的刷新时间
})
```
