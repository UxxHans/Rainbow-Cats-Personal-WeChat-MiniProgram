## 打印日志

```javascript
const admin = require('tcb-admin-node')
let logMsg = {name: 'luke', age: '25'} // msg必须为对象

// 输出log级别
admin.logger().log(logMsg)

// 输出warn级别
admin.logger().warn(logMsg)

// 输出error级别
admin.logger().error(logMsg)

// 输出info级别
admin.logger().info(logMsg)
```
