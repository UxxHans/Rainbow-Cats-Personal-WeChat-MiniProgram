const httpRequest = require('../utils/httpRequest')

exports.callWxOpenApi = function({ apiName, requestData } = {}) {
  try {
    requestData = requestData ? JSON.stringify(requestData) : ''
  } catch (e) {
    throw Error(e)
  }

  const params = {
    action: 'wx.api',
    apiName,
    requestData
  }

  return httpRequest({
    config: this.config,
    params,
    method: 'post',
    headers: {
      'content-type': 'application/json'
    }
  }).then(res => {
    if (res.code) {
      return res
    } else {
      let result
      try {
        result = JSON.parse(res.data.responseData)
      } catch (e) {
        result = res.data.responseData
      }
      return {
        result,
        requestId: res.requestId
      }
    }
  })
}

/**
 * 调用wxopenAPi
 * @param {String} apiName  接口名
 * @param {Buffer} requestData
 * @return {Promise} 正常内容为buffer，报错为json {code:'', message:'', resquestId:''}
 */
exports.callCompatibleWxOpenApi = function({ apiName, requestData } = {}) {
  const params = {
    action: 'wx.openApi',
    apiName,
    requestData
  }

  return httpRequest({
    config: this.config,
    params,
    method: 'post',
    headers: {}
  })
}

/**
 * wx.wxPayApi 微信支付用
 * @param {String} apiName  接口名
 * @param {Buffer} requestData
 * @return {Promise} 正常内容为buffer，报错为json {code:'', message:'', resquestId:''}
 */
exports.callWxPayApi = function({ apiName, requestData } = {}) {
  const params = {
    action: 'wx.wxPayApi',
    apiName,
    requestData
  }

  return httpRequest({
    config: this.config,
    params,
    method: 'post',
    headers: {}
  })
}
