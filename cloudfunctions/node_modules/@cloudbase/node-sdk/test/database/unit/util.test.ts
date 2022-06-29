import * as assert from 'power-assert'
import { Util } from '@cloudbase/database/src/util'
import * as Mock from './mock'

describe('test/unit/util.test.ts', () => {
  it('Util - formatDocumentData ', async () => {
    const data = Util.formatResDocumentData(Mock.documentRes.data)
    assert.strictEqual(data[0]['a'], 'a')
    assert.strictEqual(data[0]['f'], null)
    assert.strictEqual(data[0]['g'].longitude, 23)
    assert.strictEqual(data[0]['g'].latitude, -78)
  })

  // it('Util - encodeDocumentDataForReq ', async () => {
  //   const param = Util.formatResDocumentData(Mock.documentRes.data)
  //   const data = Util.encodeDocumentDataForReq(param[0])
  //   assert.strictEqual(data['a'], 'a')
  //   assert(data['w'].$date)
  // })
})
