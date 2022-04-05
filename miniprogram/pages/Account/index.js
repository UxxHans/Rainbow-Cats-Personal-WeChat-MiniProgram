Page({

  // 存储请求结果
  data: {
    kirbyCredit: "0",
    deeCredit: "0",
  },

  async getKirbyCredit(){
    const db = await getApp().database()
    db.collection(getApp().globalData.collectionUserList).where({
      _openid: getApp().globalData.kirbyOpenId
    }).get().then(dataGot => {
        // 将数据保存到本地、更新显示
        const {data} = dataGot
        this.setData({
          kirbyCredit: String(data[0].credit)
        })
    })
  },

  async getDeeCredit(){
    const db = await getApp().database()
    db.collection(getApp().globalData.collectionUserList).where({
      _openid: getApp().globalData.deeOpenId
    }).get().then(dataGot => {
        // 将数据保存到本地、更新显示
        const {data} = dataGot
        this.setData({
          deeCredit: String(data[0].credit)
        })
    })
  },

   onShow(){
     this.getKirbyCredit()
     this.getDeeCredit()
   }
})