exports.filterValue = function filterValue(o, value) {
  for (let key in o) {
    if (o[key] === value) {
      delete o[key]
    }
  }
}

exports.filterUndefined = function(o) {
  return exports.filterValue(o, undefined)
}

exports.filterNull = function(o) {
  return exports.filterValue(o, null)
}

exports.filterEmptyString = function(o) {
  return exports.filterValue(o, '')
}

exports.deepFreeze = function(o) {
  if (typeof value !== 'object') {
    return o
  }

  Object.freeze(o)

  Object.getOwnPropertyNames(o).forEach(function(prop) {
    const value = o[prop]
    if (
      typeof value === 'object' &&
      value !== null &&
      !Object.isFrozen(value)
    ) {
      exports.deepFreeze(value)
    }
  })

  return o
}

exports.warpPromise = function warp(fn) {
  return function(...args) {
    // 确保返回 Promise 实例
    return new Promise((resolve, reject) => {
      try {
        return fn(...args)
          .then(resolve)
          .catch(reject)
      } catch (e) {
        reject(e)
      }
    })
  }
}

exports.getCurrentEnv = function() {
  return process.env.TCB_ENV || process.env.SCF_NAMESPACE
}
