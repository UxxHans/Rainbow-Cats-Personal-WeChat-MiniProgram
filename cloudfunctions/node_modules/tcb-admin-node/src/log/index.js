/**
 *
 *
 * @class Log
 */
class Log {
  constructor() {
    this.src = 'app'
  }

  /**
   *
   *
   * @param {*} logMsg
   * @param {*} logLevel
   * @returns
   * @memberof Log
   */
  transformMsg(logMsg) {
    // 目前logMsg只支持字符串value且不支持多级, 加一层转换处理
    let realMsg = {}

    realMsg = Object.assign({}, realMsg, logMsg)
    return realMsg
  }

  /**
   *
   *
   * @param {*} logMsg
   * @param {*} logLevel
   * @memberof Log
   */
  baseLog(logMsg, logLevel) {
    // 判断当前是否属于tcb scf环境

    if (Object.prototype.toString.call(logMsg).slice(8, -1) !== 'Object') {
      throw Error('please input correct log msg')
    }

    const msgContent = this.transformMsg(logMsg)

    console.__baseLog__(msgContent, logLevel)
  }

  /**
   *
   *
   * @param {*} logMsg
   * @memberof Log
   */
  log(logMsg) {
    this.baseLog(logMsg, 'log')
  }

  /**
   *
   *
   * @param {*} logMsg
   * @memberof Log
   */
  info(logMsg) {
    this.baseLog(logMsg, 'info')
  }

  /**
   *
   *
   * @param {*} logMsg
   * @memberof Log
   */
  error(logMsg) {
    this.baseLog(logMsg, 'error')
  }

  /**
   *
   *
   * @param {*} logMsg
   * @memberof Log
   */
  warn(logMsg) {
    this.baseLog(logMsg, 'warn')
  }
}

exports.logger = () => {
  return new Log()
}
