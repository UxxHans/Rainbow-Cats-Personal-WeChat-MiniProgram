import tcb from '../../src/index'
import assert from 'assert'
import config from '../config.local'
import { ERROR } from '../../lib/const/code'

describe('analytics.report: 上报分析数据', () => {
    const app = tcb.init(config)

    //
    it('上报分析数据', async () => {
        process.env.WX_CONTEXT_KEYS = 'WX_OPENID,WX_APPID'
        process.env.WX_OPENID = 'mock_wxopenid'
        process.env.WX_APPID = 'mock_wxappid'
        try {
            await app.analytics({
                report_type: 'mall',
                report_data: {
                    action_time: new Date().getTime(),
                    action_type: 'visit_store',
                }
            })
        } catch (err) {
            console.log('err:', err)
        }
        process.env.WX_CONTEXT_KEYS = ''
        process.env.WX_OPENID = ''
        process.env.WX_APPID = ''
    }, 30000)
})
