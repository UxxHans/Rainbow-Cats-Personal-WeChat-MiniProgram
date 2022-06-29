import * as Config from '../../config.local'

export const env = Config.env
export const appId = Config.appId

/**
 * 一篇后端返回的文档数据
 */
export const documentRes = {
  data: [
    {
      _id: '5b2509efdc9c81268a7348d3',
      a: 'a',
      b: 23,
      c: {
        a: 'a',
        b: 'b'
      },
      d: [
        '1',
        '2',
        {
          $date: 1529234575
        }
      ],
      e: true,
      f: null,
      g: {
        coordinates: [23, -78],
        type: 'Point'
      },
      w: {
        $date: 1529154030
      }
    }
  ],
  db_name: 'default',
  env_key: 'tcbenv-ZkSRV2p8',
  pager: {
    offset: 0,
    length: 6,
    total: 1
  },
  uin: 100003143464
}

/**
 * 一篇请求的文档
 */
export const documentReq = {
  a: 'a',
  b: 23,
  c: {
    c1: 'c1',
    c2: ['1', '2'],
    c3: true
  },
  d: [
    'd1',
    'd2',
    {
      d3: 'd3'
    }
  ],
  e: true,
  f: {
    f: false
  },
  h: null,
  g: {
    type: 'Point',
    coordinates: [23, -93]
  },
  w: {
    $timestamp: 1529327280
  }
}
