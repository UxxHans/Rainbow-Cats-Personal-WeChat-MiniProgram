// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})

// 云函数入口函数
exports.main = async (event, context) => {
  // 返回当前用户的身份信息，用于数据库记录和查询
  return cloud.getWXContext().OPENID
}