// 由定时触发器触发时（TRIGGER_SRC=timer）：优先使用 WX_TRIGGER_API_TOKEN_V0，不存在的话，为了兼容兼容旧的开发者工具，也是使用 WX_API_TOKEN
// 非定时触发器触发时（TRIGGER_SRC!=timer）: 使用 WX_API_TOKEN
function getWxCloudApiToken() {
  if (process.env.TRIGGER_SRC === 'timer') {
    return process.env.WX_TRIGGER_API_TOKEN_V0 || process.env.WX_API_TOKEN || ''
  } else {
    return process.env.WX_API_TOKEN || ''
  }
}

module.exports = getWxCloudApiToken
