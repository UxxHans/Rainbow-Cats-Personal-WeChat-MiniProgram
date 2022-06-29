// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ // 初始化云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV // 当前环境的常量
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (context) => {
  // 根据待办 _id，获得并更新待办事项状态
  return await db.collection(context.list).where({
    _id: context._id
  }).update({
    data: {
      available: context.value
    }
  })
}