let localConfig
try {
  localConfig = require('./config')
} catch (e) {
  localConfig = {
    secretId: process.env.TEST_SECRET_ID || global.TEST_SECRET_ID, // 走travis 会注入全局变量
    secretKey: process.env.TEST_SECRET_KEY || global.TEST_SECRET_KEY,
    env: process.env.TEST_ENV || global.TEST_ENV,
    appId: process.env.TEST_APP_ID,
    region: process.env.REGION,
    credentials: {
      private_key_id: 'mock-private-key-id',
      private_key: 'mock-private-key'
    }
  }
}
module.exports = localConfig
