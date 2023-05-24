import { E } from '../utils/utils'
import { ERROR } from '../const/code'
import { CloudBase } from '../cloudbase'

/**
 *
 *
 * @class Log
 */
export class Log {
    public isSupportClsReport: boolean
    private src

    public constructor() {
        const { _SCF_TCB_LOG } = CloudBase.getCloudbaseContext()
        this.src = 'app'
        this.isSupportClsReport = true
        if (`${_SCF_TCB_LOG}` !== '1') {
            this.isSupportClsReport = false
        } else if (!(console as any).__baseLog__) {
            this.isSupportClsReport = false
        }

        if (!this.isSupportClsReport) {
            // 当前非tcb scf环境  log功能会退化为console
            console.warn(
                '请检查您是否在本地环境 或者 未开通高级日志功能，当前环境下无法上报cls日志，默认使用console'
            )
        }
    }

    /**
     *
     *
     * @param {*} logMsg
     * @param {*} logLevel
     * @returns
     * @memberof Log
     */
    public transformMsg(logMsg) {
        // 目前logMsg只支持字符串value且不支持多级, 加一层转换处理
        let realMsg = {}

        realMsg = { ...realMsg, ...logMsg }
        return realMsg
    }

    /**
     *
     *
     * @param {*} logMsg
     * @param {*} logLevel
     * @memberof Log
     */
    public baseLog(logMsg, logLevel) {
        // 判断当前是否属于tcb scf环境

        if (Object.prototype.toString.call(logMsg).slice(8, -1) !== 'Object') {
            throw E({
                ...ERROR.INVALID_PARAM,
                message: 'log msg must be an object'
            })
        }

        const msgContent = this.transformMsg(logMsg)

        if (this.isSupportClsReport) {
            ;(console as any).__baseLog__(msgContent, logLevel)
        } else {
            if (console[logLevel]) {
                console[logLevel](msgContent)
            }
        }
    }

    /**
     *
     *
     * @param {*} logMsg
     * @memberof Log
     */
    public log(logMsg) {
        this.baseLog(logMsg, 'log')
    }

    /**
     *
     *
     * @param {*} logMsg
     * @memberof Log
     */
    public info(logMsg) {
        this.baseLog(logMsg, 'info')
    }

    /**
     *
     *
     * @param {*} logMsg
     * @memberof Log
     */
    public error(logMsg) {
        this.baseLog(logMsg, 'error')
    }

    /**
     *
     *
     * @param {*} logMsg
     * @memberof Log
     */
    public warn(logMsg) {
        this.baseLog(logMsg, 'warn')
    }
}

export function logger() {
    return new Log()
}
