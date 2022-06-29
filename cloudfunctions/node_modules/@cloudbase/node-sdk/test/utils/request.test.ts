import tcb from '../../src/index'
import config from '../config.local'

describe('tcb.init: 初始化tcb', () => {
    const app = tcb.init(config)
    it('test', async () => {
        try {
            const resp: any = await app.request(
                {
                    proxy: '',
                    method: 'GET',
                    timeout: 1000,
                    url: 'http://127.0.0.1:55534'
                },
                {
                    op: '~~~~~',
                    seqId: '123134123413'
                    // retryOptions: {
                    //   timeouts: [10, 20, 30, 40, 50]
                    // }
                }
            )
            console.log(resp.attempt, resp.body, 'result|||||||||||||||||||||||')
        } catch (e) {
            // console.error(e.attempt)
        }
    })
})
