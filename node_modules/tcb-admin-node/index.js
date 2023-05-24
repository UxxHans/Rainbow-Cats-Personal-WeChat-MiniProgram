const Db = require('@cloudbase/database').Db
const storage = require('./src/storage')
const functions = require('./src/functions')
const auth = require('./src/auth')
const wx = require('./src/wx')
const Request = require('./src/utils/dbRequest')
const logger = require('./src/log')
const { SYMBOL_CURRENT_ENV } = require('./src/const/symbol')
const { getCurrentEnv } = require('./src/utils/utils')

const ExtRequest = require('./src/utils/extRequest')

function Tcb(config) {
  this.config = config ? config : this.config
  this.requestClient = new ExtRequest()
  this.SYMBOL_CURRENT_ENV = SYMBOL_CURRENT_ENV
}

Tcb.prototype.init = function({
  secretId,
  secretKey,
  sessionToken,
  debug,
  env,
  proxy,
  timeout,
  serviceUrl,
  version,
  headers = {},
  credentials,
  timingsMeasurer,
  isHttp,
  signMethod = 'v2',
  isUpdateSelfConfig = true,
  forever = false
} = {}) {
  if ((secretId && !secretKey) || (!secretId && secretKey)) {
    throw Error('secretId and secretKey must be a pair')
  }

  const config = {
    get secretId() {
      return this._secretId ? this._secretId : process.env.TENCENTCLOUD_SECRETID
    },
    set secretId(id) {
      this._secretId = id
    },
    get secretKey() {
      return this._secretKey
        ? this._secretKey
        : process.env.TENCENTCLOUD_SECRETKEY
    },
    set secretKey(key) {
      this._secretKey = key
    },
    get sessionToken() {
      if (this._sessionToken === undefined) {
        //默认临时密钥
        return process.env.TENCENTCLOUD_SESSIONTOKEN
      } else if (this._sessionToken === false) {
        //固定秘钥
        return undefined
      } else {
        //传入的临时密钥
        return this._sessionToken
      }
    },
    set sessionToken(token) {
      this._sessionToken = token
    },
    envName: env,
    proxy: proxy,
    isHttp: isHttp,
    headers: Object.assign({}, headers)
  }

  config.debug = debug
  config.forever = forever
  config.signMethod = signMethod
  config.timingsMeasurer = timingsMeasurer
  config.secretId = secretId
  config.secretKey = secretKey
  config.timeout = timeout || 15000
  config.serviceUrl = serviceUrl
  config.credentials = credentials
  config.sessionToken = sessionToken
    ? sessionToken
    : secretId && secretKey
    ? false
    : undefined

  if (version) {
    config.headers['x-sdk-version'] = version
  }

  // 这里的目的是创建新实例时可以避免更新当前实例
  if (isUpdateSelfConfig) {
    this.config = config
  }

  return new Tcb(config)
}

Tcb.prototype.database = function(dbConfig = {}) {
  Db.reqClass = Request
  if (Object.prototype.toString.call(dbConfig).slice(8, -1) !== 'Object') {
    throw Error('dbConfig must be an object')
  }

  if (dbConfig && dbConfig.env) {
    // env变量名转换
    dbConfig.envName = dbConfig.env
    delete dbConfig.env
  }
  this.config = Object.assign(this.config, dbConfig)
  return new Db({ ...this })
}

/**
 * @returns string
 */
Tcb.prototype.getCurrentEnv = function() {
  return getCurrentEnv()
}

const extensionMap = {}
/**
 * 注册扩展
 */
Tcb.prototype.registerExtension = function(ext) {
  extensionMap[ext.name] = ext
}

Tcb.prototype.invokeExtension = async function(name, opts) {
  const ext = extensionMap[name]
  if (!ext) {
    throw Error(`扩展${name} 必须先注册`)
  }

  return await ext.invoke(opts, this)
}

Tcb.prototype.parseContext = function(context) {
  if (typeof context !== 'object') {
    throw Error('context 必须为对象类型')
  }
  let {
    memory_limit_in_mb,
    time_limit_in_ms,
    request_id,
    environ = '',
    function_version,
    namespace,
    function_name,
    environment
  } = context
  let parseResult = {}

  try {
    parseResult.memoryLimitInMb = memory_limit_in_mb
    parseResult.timeLimitIns = time_limit_in_ms
    parseResult.requestId = request_id
    parseResult.functionVersion = function_version
    parseResult.namespace = namespace
    parseResult.functionName = function_name

    // 存在environment 为新架构 上新字段 JSON序列化字符串
    if (environment) {
      parseResult.environment = JSON.parse(environment)
      return parseResult
    }

    // 不存在environment 则为老字段，老架构上存在bug，无法识别value含特殊字符(若允许特殊字符，影响解析，这里特殊处理)

    const parseEnviron = environ.split(';')
    let parseEnvironObj = {}
    for (let i in parseEnviron) {
      const equalIndex = parseEnviron[i].indexOf('=')
      if (equalIndex < 0) {
        // value含分号影响切割，未找到= 均忽略
        continue
      }
      const key = parseEnviron[i].slice(0, equalIndex)
      let value = parseEnviron[i].slice(equalIndex + 1)

      // value 含, 为数组
      if (value.indexOf(',') >= 0) {
        value = value.split(',')
      }
      parseEnvironObj[key] = value
    }

    parseResult.environ = parseEnvironObj
  } catch (err) {
    throw Error('无效的context对象')
  }
  return parseResult
}

function each(obj, fn) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      fn(obj[i], i)
    }
  }
}

function extend(target, source) {
  each(source, function(val, key) {
    target[key] = source[key]
  })
  return target
}

extend(Tcb.prototype, functions)
extend(Tcb.prototype, storage)
extend(Tcb.prototype, wx)
extend(Tcb.prototype, auth)
extend(Tcb.prototype, logger)

module.exports = new Tcb()
