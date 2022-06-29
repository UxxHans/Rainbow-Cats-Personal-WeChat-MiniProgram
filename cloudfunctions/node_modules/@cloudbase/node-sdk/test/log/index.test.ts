import tcb from '../../src/index'
import config from '../config.local'
import { ERROR } from '../../lib/const/code'
import * as assert from 'power-assert'

describe('日志上报', () => {
    const app = tcb.init(config)

    it('logger', async () => {
        try {
            app.logger().log(1)
        } catch (e) {
            assert((e.code = ERROR.INVALID_PARAM.code))
        }

        try {
            app.logger().info({ a: 1 })
        } catch (e) {
            assert((e.code = ERROR.TCB_CLS_UNOPEN.code))
        }

        // // MOCK云函数环境 上报
        // process.env._SCF_TCB_LOG = '1';
    }, 30000)
})
