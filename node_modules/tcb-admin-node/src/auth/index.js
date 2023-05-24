const jwt = require('jsonwebtoken')
const { SYMBOL_CURRENT_ENV } = require('../const/symbol')
const { getCurrentEnv } = require('../utils/utils')

const checkCustomUserIdRegex = /^[a-zA-Z0-9_\-#@~=*(){}[\]:.,<>+]{4,32}$/

function validateUid(uid) {
  if (typeof uid !== 'string') {
    throw new TypeError('uid must be a string')
  }
  if (!checkCustomUserIdRegex.test(uid)) {
    throw new Error(`Invalid uid: "${uid}"`)
  }
}

exports.auth = function() {
  let self = this
  return {
    getUserInfo() {
      const openId = process.env.WX_OPENID || ''
      const appId = process.env.WX_APPID || ''
      const uid = process.env.TCB_UUID || ''
      const customUserId = process.env.TCB_CUSTOM_USER_ID || ''
      const isAnonymous =
        process.env.TCB_ISANONYMOUS_USER === 'true' ? true : false

      return {
        openId,
        appId,
        uid,
        customUserId,
        isAnonymous
      }
    },
    async getAuthContext(context) {
      const { environment, environ } = self.parseContext(context)
      const env = environment || environ || {}
      const { TCB_UUID, LOGINTYPE } = env
      const res = {
        uid: TCB_UUID,
        loginType: LOGINTYPE
      }
      if (LOGINTYPE === 'QQ-MINI') {
        const { QQ_OPENID, QQ_APPID } = env
        res.appId = QQ_APPID
        res.openId = QQ_OPENID
      }
      return res
    },
    getClientIP() {
      return process.env.TCB_SOURCE_IP || ''
    },
    createTicket: (uid, options = {}) => {
      validateUid(uid)
      const timestamp = new Date().getTime()
      let { credentials, envName } = this.config
      if (!envName) {
        throw new Error('no env in config')
      }

      // 使用symbol时替换为环境变量内的env
      if (envName === SYMBOL_CURRENT_ENV) {
        envName = getCurrentEnv()
      }

      const {
        refresh = 3600 * 1000,
        expire = timestamp + 7 * 24 * 60 * 60 * 1000
      } = options
      var token = jwt.sign(
        {
          alg: 'RS256',
          env: envName,
          iat: timestamp,
          exp: timestamp + 10 * 60 * 1000, // ticket十分钟有效
          uid,
          refresh,
          expire
        },
        credentials.private_key,
        { algorithm: 'RS256' }
      )

      return credentials.private_key_id + '/@@/' + token
    }
  }
}
