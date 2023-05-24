var crypto = require('crypto')

function camSafeUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}
function map(obj, fn) {
  var o = isArray(obj) ? [] : {}
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = fn(obj[i], i)
    }
  }
  return o
}
function isArray(arr) {
  return arr instanceof Array
}

function clone(obj) {
  return map(obj, function(v) {
    return typeof v === 'object' && v !== undefined && v !== null ? clone(v) : v
  })
}
//测试用的key后面可以去掉
var getAuth = function(opt) {
  opt = opt || {}

  var SecretId = opt.SecretId
  var SecretKey = opt.SecretKey
  var method = (opt.method || opt.Method || 'get').toLowerCase()
  var pathname = opt.pathname || '/'
  var queryParams = clone(opt.Query || opt.params || {})
  var headers = clone(opt.Headers || opt.headers || {})
  pathname.indexOf('/') !== 0 && (pathname = '/' + pathname)

  if (!SecretId) {
    throw Error('missing param SecretId')
  }

  if (!SecretKey) {
    throw Error('missing param SecretKey')
  }

  var getObjectKeys = function(obj) {
    var list = []
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] === undefined) {
          continue
        }
        list.push(key)
      }
    }
    return list.sort()
  }

  var obj2str = function(obj) {
    var i, key, val
    var list = []
    var keyList = getObjectKeys(obj)
    for (i = 0; i < keyList.length; i++) {
      key = keyList[i]
      if (obj[key] === undefined) {
        continue
      }
      val = obj[key] === null ? '' : obj[key]
      if (typeof val !== 'string') {
        val = JSON.stringify(val)
      }
      key = key.toLowerCase()
      key = camSafeUrlEncode(key)
      val = camSafeUrlEncode(val) || ''
      list.push(key + '=' + val)
    }
    return list.join('&')
  }

  // 签名有效起止时间
  var now = parseInt(new Date().getTime() / 1000) - 1
  var exp = now

  var Expires = opt.Expires || opt.expires
  if (Expires === undefined) {
    exp += 900 // 签名过期时间为当前 + 900s
  } else {
    exp += Expires * 1 || 0
  }

  // 要用到的 Authorization 参数列表
  var qSignAlgorithm = 'sha1'
  var qAk = SecretId
  var qSignTime = now + ';' + exp
  var qKeyTime = now + ';' + exp
  var qHeaderList = getObjectKeys(headers)
    .join(';')
    .toLowerCase()
  var qUrlParamList = getObjectKeys(queryParams)
    .join(';')
    .toLowerCase()

  // 签名算法说明文档：https://www.qcloud.com/document/product/436/7778
  // 步骤一：计算 SignKey
  var signKey = crypto
    .createHmac('sha1', SecretKey)
    .update(qKeyTime)
    .digest('hex')

  // console.log("queryParams", queryParams);
  // console.log(obj2str(queryParams));

  // 步骤二：构成 FormatString
  var formatString = [
    method,
    pathname,
    obj2str(queryParams),
    obj2str(headers),
    ''
  ].join('\n')

  // console.log(formatString);
  formatString = Buffer.from(formatString, 'utf8')

  // 步骤三：计算 StringToSign
  var sha1Algo = crypto.createHash('sha1')
  sha1Algo.update(formatString)
  var res = sha1Algo.digest('hex')
  var stringToSign = ['sha1', qSignTime, res, ''].join('\n')

  // console.log(stringToSign);
  // 步骤四：计算 Signature
  var qSignature = crypto
    .createHmac('sha1', signKey)
    .update(stringToSign)
    .digest('hex')

  // 步骤五：构造 Authorization
  var authorization = [
    'q-sign-algorithm=' + qSignAlgorithm,
    'q-ak=' + qAk,
    'q-sign-time=' + qSignTime,
    'q-key-time=' + qKeyTime,
    'q-header-list=' + qHeaderList,
    'q-url-param-list=' + qUrlParamList,
    'q-signature=' + qSignature
  ].join('&')

  return authorization
}

exports.getAuth = getAuth
