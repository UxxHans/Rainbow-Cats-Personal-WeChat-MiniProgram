// import CloudBase from '@cloudbase/manager-node'
import tcb from '../../src/index'
import assert from 'assert'
import config from '../config.local'

describe('mock extension', () => {
    it('register extension', async () => {
        const app = tcb.init(config)
        app.registerExtension({
            name: 'testExtension',
            invoke: () => 'invoke success'
        })

        const invokeRes = await app.invokeExtension('testExtension', {})

        expect(invokeRes).toBe('invoke success')
    })

    it('invoke unexist extension', async () => {
        const app = tcb.init(config)
        const name = 'unexistExtension'
        expect(app.invokeExtension(name, {})).rejects.toThrow(new Error(`扩展${name} 必须先注册`))
    })
})
