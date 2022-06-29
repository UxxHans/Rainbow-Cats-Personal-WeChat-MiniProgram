const http = require('http')
const request = require('request')
const auth = require('./auth.js')
const tracing = require('./tracing')
const utils = require('./utils')
const version = require('../../package.json').version
const getWxCloudApiToken = require('./getWxCloudApiToken')
const RequestTimgingsMeasurer = require('./request-timings-measurer')
  .RequestTimgingsMeasurer
const URL = require('url')
const { sign } = require('@cloudbase/signature-nodejs')
const { SYMBOL_CURRENT_ENV } = require('../const/symbol')

module.exports = utils.warpPromise(doRequest)

async function doRequest(args) {
  const config = args.config
  const method = args.method || 'post'
  const signMethod = config.signMethod || 'v2'
  const protocol = config.isHttp === true ? 'http' : 'https'
  const isInSCF = process.env.TENCENTCLOUD_RUNENV === 'SCF'

  if (!config.secretId || !config.secretKey) {
    if (isInSCF) {
      throw Error('missing authoration key, redeploy the function')
    }
    throw Error('missing secretId or secretKey of tencent cloud')
  }

  const tracingInfo = tracing.generateTracingInfo()
  const seqId = tracingInfo.seqId
  const eventId = tracingInfo.eventId

  // 检查envName 是否为symbol
  if (config.envName === SYMBOL_CURRENT_ENV) {
    config.envName = utils.getCurrentEnv()
  }

  const params = Object.assign({}, args.params, {
    envName: config.envName,
    timestamp: new Date().valueOf(),
    eventId,
    wxCloudApiToken: getWxCloudApiToken(),
    // 对应服务端 wxCloudSessionToken
    tcb_sessionToken: process.env.TCB_SESSIONTOKEN || ''
  })
  utils.filterUndefined(params)

  // wx.openApi 以及 wx.wxPayApi 带的requestData 需避开签名

  let requestData = null
  if (params.action === 'wx.openApi' || params.action === 'wx.wxPayApi') {
    requestData = params['requestData']
    delete params['requestData']
  }

  // Note: 云函数被调用时可能调用端未传递 SOURCE，TCB_SOURCE 可能为空
  const TCB_SOURCE = process.env.TCB_SOURCE || ''
  const SOURCE = isInSCF ? `${TCB_SOURCE},scf` : ',not_scf'

  // url
  let url = ''
  if (config.serviceUrl) {
    url = config.serviceUrl
  } else {
    url = protocol + '://tcb-admin.tencentcloudapi.com/admin'

    if (isInSCF) {
      url = 'http://tcb-admin.tencentyun.com/admin'
    }

    if (
      params.action === 'wx.api' ||
      params.action === 'wx.openApi' ||
      params.action === 'wx.wxPayApi'
    ) {
      url = protocol + '://tcb-open.tencentcloudapi.com/admin'
      if (isInSCF) {
        url = 'http://tcb-open.tencentyun.com/admin'
      }
    }
  }

  if (url.includes('?')) {
    url = `${url}&eventId=${eventId}&seqId=${seqId}`
  } else {
    url = `${url}?&eventId=${eventId}&seqId=${seqId}`
  }

  let headers = {}

  if (signMethod === 'v3') {
    headers = {
      'x-tcb-source': SOURCE,
      'User-Agent': `tcb-admin-sdk/${version}`,
      'X-SDK-Version': `tcb-admin-sdk/${version}`,
      Host: URL.parse(url).host
    }

    if (params.action === 'wx.openApi' || params.action === 'wx.wxPayApi') {
      headers['content-type'] = 'multipart/form-data'
    }

    headers = Object.assign({}, config.headers, args.headers, headers)

    const signInfo = sign({
      secretId: config.secretId,
      secretKey: config.secretKey,
      method: method,
      url: url,
      params: params,
      headers,
      withSignedParams: true
    })

    headers['Authorization'] = signInfo.authorization
    headers['X-Signature-Expires'] = 600
    headers['X-Timestamp'] = signInfo.timestamp
  } else {
    headers = {
      'user-agent': `tcb-admin-sdk/${version}`,
      'x-tcb-source': SOURCE
    }

    const authObj = {
      SecretId: config.secretId,
      SecretKey: config.secretKey,
      Method: method,
      pathname: '/admin',
      Query: params,
      Headers: Object.assign({}, headers)
    }

    params.authorization = auth.getAuth(authObj)

    headers = Object.assign({}, config.headers, args.headers, headers)
  }

  requestData && (params.requestData = requestData)
  config.sessionToken && (params.sessionToken = config.sessionToken)
  params.sdk_version = version

  const opts = {
    url,
    method: args.method || 'post',
    // 先取模块的timeout，没有则取sdk的timeout，还没有就使用默认值
    timeout: args.timeout || config.timeout || 15000,
    headers,
    proxy: config.proxy
  }

  if (args.method == 'post') {
    if (params.action === 'wx.openApi' || params.action === 'wx.wxPayApi') {
      opts.formData = params
      opts.encoding = null
    } else {
      opts.body = params
      opts.json = true
    }
  } else {
    opts.qs = params
  }

  if (args.proxy) {
    opts.proxy = args.proxy
  }

  // 针对数据库请求设置慢查询提示
  let slowQueryWarning = null
  if (params.action.indexOf('database') >= 0) {
    slowQueryWarning = setTimeout(() => {
      console.warn(
        `Database operation ${params.action} is longer than 3s. Please check query performance and your network environment. | [${seqId}]`
      )
    }, 3000)
  }

  try {
    return new Promise(function(resolve, reject) {
      const timingsMeasurerOptions = config.timingsMeasurer || {}
      const {
        waitingTime = 1000,
        interval = 200,
        enable = !!config.debug
      } = timingsMeasurerOptions
      const timingsMeasurer = RequestTimgingsMeasurer.new({
        waitingTime,
        interval,
        enable
      })

      let targetName = ''
      if (params.action.startsWith('functions')) {
        targetName = params.function_name
      } else if (params.action.startsWith('database')) {
        targetName = params.collectionName
      } else if (params.action.startsWith('wx')) {
        targetName = params.apiName
      }

      timingsMeasurer.on('progress', timings => {
        const timingsLine = `s:${timings.socket || '-'}|l:${timings.lookup ||
          '-'}|c:${timings.connect || '-'}|r:${timings.ready ||
          '-'}|w:${timings.waiting || '-'}|d:${timings.download ||
          '-'}|e:${timings.end || '-'}`
        console.warn(
          `[RequestTimgings] Operation [${
            params.action
          }:${targetName}] spent ${Date.now() -
            timings.start}ms(${timingsLine}) [${seqId}]`
        )
      })

      if (config.forever) {
        opts.forever = true
      }

      const clientRequest = request(opts, function(err, response, body) {
        args && args.callback && args.callback(response)
        if (err) {
          return reject(err)
        }

        if (response.statusCode === 200) {
          let res
          try {
            res = typeof body === 'string' ? JSON.parse(body) : body
            // wx.openApi 和 wx.wxPayApi 调用时，需用content-type区分buffer or JSON
            if (
              params.action === 'wx.openApi' ||
              params.action === 'wx.wxPayApi'
            ) {
              const { headers } = response
              if (
                headers['content-type'] === 'application/json; charset=utf-8'
              ) {
                res = JSON.parse(res.toString()) // JSON错误时buffer转JSON
              }
            }
          } catch (e) {
            res = body
          }
          return resolve(res)
        } else {
          // 避免非 200 错误导致返回空内容
          const e = new Error(`
            ${response.statusCode} ${http.STATUS_CODES[response.statusCode]}
          `)
          e.statusCode = response.statusCode
          reject(e)
        }
      })
      timingsMeasurer.measure(clientRequest)
    })
  } finally {
    if (slowQueryWarning) {
      clearTimeout(slowQueryWarning)
    }
  }
}
