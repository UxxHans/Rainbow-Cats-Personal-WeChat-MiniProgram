function concatKeys(obj, key, res) {
  let keys, val

  for (let k in obj) {
    if (typeof obj[k] === 'object') {
      keys = key ? key + '.' + k : k
      concatKeys(obj[k], keys, res)
    } else {
      keys = key ? key + '.' + k : k
      val = obj[k]

      Object.assign(res, { [keys]: val })
      // console.log(keys, val)
    }
  }
}

const a = {
  'l-01': {
    level: 1,
    name: 'l-01',
    flag: '1111111',
    'l-02.01': {
      level: 2,
      name: 'l-02.01',
      flag: '2222222',
      'l-03.01': {
        level: 3,
        name: 'l-03.01',
        flag: '33333333',
        'l-04.01': {
          level: 4,
          name: 'l-04.01',
          flag: '4444444444'
        }
      }
    },
    'l-02.02': {
      level: 1,
      name: 'l-01.2',
      flag: '1212121212'
    }
  }
}
let res = {}
concatKeys(a, '', res)
console.log(res)
