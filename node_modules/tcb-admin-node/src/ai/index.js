const httpRequest = require('../utils/httpRequest')

/**
 * 调用AI服务
 * @param {Object} param  AI 服务参数
 * @return {Promise}
 */
function callAI({ param }) {
  try {
    param = param ? JSON.stringify(param) : ''
  } catch (e) {
    return Promise.reject(e)
  }
  if (!param) {
    return Promise.reject(new Error({ message: '参数不能为空' }))
  }

  let params = Object.assign(this.commParam, {
    action: 'ai.invokeAI',
    param
  })

  return httpRequest({
    config: this.config,
    secretId: this.config.secretId,
    secretKey: this.config.secretKey,
    params,
    method: 'post',
    headers: {
      'content-type': 'application/json'
    }
  })
}

exports.callAI = callAI
