const httpRequest = require('./httpRequest')
const requestClient = require('request')

/**
 * 扩展模块的请求类
 *
 */
class ExtRequest {
  /**
   * 初始化
   *
   * @internal
   * @param config
   */
  // constructor(config) {
  //   this.config = config
  // }

  /**
   * 发送 tcb 请求
   *
   * @param api   - 接口
   * @param data  - 参数
   */
  // async tcbRequest(api, data) {
  //   const params = Object.assign({}, data, {
  //     action: api
  //   })

  //   return await httpRequest({
  //     timeout: this.config.timeout,
  //     config: this.config,
  //     params,
  //     method: 'post',
  //     headers: {
  //       'content-type': 'application/json'
  //     }
  //   })
  // }

  get(options) {
    return this.rawRequest({
      ...options,
      method: 'get'
    })
  }
  post(options) {
    return this.rawRequest({
      ...options,
      method: 'post'
    })
  }
  put(options) {
    return this.rawRequest({
      ...options,
      method: 'put'
    })
  }

  /**
   * 发送普通请求
   * @param {*} opts
   */
  async rawRequest(opts) {
    let res = await new Promise((resolve, reject) => {
      requestClient(opts, function(err, res, body) {
        if (err) {
          reject(err)
        } else {
          resolve({
            data: body,
            statusCode: res.statusCode,
            header: res.headers
          })
        }
      })
    })

    return res
  }
}

module.exports = ExtRequest
