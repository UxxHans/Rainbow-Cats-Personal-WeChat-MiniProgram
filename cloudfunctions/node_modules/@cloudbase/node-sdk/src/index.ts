import { CloudBase } from './cloudbase'
import { ICloudBaseConfig, IContextParam } from './type'
import { SYMBOL_CURRENT_ENV } from './const/symbol'
import { extraRequest } from './utils/request'

const { version } = require('../package.json')

export = {
    request: extraRequest,

    init: (config?: ICloudBaseConfig): CloudBase => {
        return new CloudBase(config)
    },
    parseContext: (context: IContextParam) => {
        // 校验context 是否正确
        return CloudBase.parseContext(context)
    },
    version,
    getCloudbaseContext: (context?: any) => {
        return CloudBase.getCloudbaseContext(context)
    },
    /**
     * 云函数下获取当前env
     */
    SYMBOL_CURRENT_ENV: SYMBOL_CURRENT_ENV
}
