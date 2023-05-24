const httpRequest = require('../utils/httpRequest')

/**
 * 调用云函数
 * @param {String} name  函数名
 * @param {Object} functionParam 函数参数
 * @return {Promise}
 */
function callFunction({ name, data }) {
  try {
    data = data ? JSON.stringify(data) : ''
  } catch (e) {
    return Promise.reject(e)
  }
  if (!name) {
    return Promise.reject(
      new Error({
        message: '函数名不能为空'
      })
    )
  }

  const params = {
    action: 'functions.invokeFunction',
    function_name: name,
    request_data: data
  }

  return httpRequest({
    config: this.config,
    params,
    method: 'post',
    headers: {
      'content-type': 'application/json',
      ...(process.env.TCB_ROUTE_KEY
        ? { 'X-Tcb-Route-Key': process.env.TCB_ROUTE_KEY }
        : {})
    }
  }).then(res => {
    if (res.code) {
      return res
    } else {
      let result
      try {
        result = JSON.parse(res.data.response_data)
      } catch (e) {
        result = res.data.response_data
      }
      return {
        result,
        requestId: res.requestId
      }
    }
  })
}

exports.callFunction = callFunction
