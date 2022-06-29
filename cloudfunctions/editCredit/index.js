// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (context) => {
  //更改积分数量，减少可用负数
  return await db.collection(context.list).where({
    _openid: context._openid
  }).update({
    data: {
      credit: db.command.inc(context.value)
    }
  })
}