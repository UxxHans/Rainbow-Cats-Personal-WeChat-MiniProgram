/* 上架列表首页 */

Page({
  // 存储请求结果
  data: {
    allItems: [], // 用户的所有上架商品
    unboughtItems: [], // 未完成上架商品
    boughtItems: [], // 已完成上架商品
    kirbyOpenId : getApp().globalData.kirbyOpenId,
    deeOpenId : getApp().globalData.deeOpenId,
    currentCredit: 0,
  },

  async onShow() {
      this.getCurrentCredit()
      // 查询并展示上架列表
      const db = await getApp().database()
      db.collection(getApp().globalData.collectionMarketList).get().then(dataGot => {
        const {data} = dataGot
        // 存储查询到的数据
        this.setData({
          // data 为查询到的所有上架商品列表
          allItems: data,
          // 通过 filter 函数，将上架商品分为未购买和已购买两部分
          unboughtItems: data.filter(item => item.freq === 0),
          boughtItems: data.filter(item => item.freq === 1)
        })
      })
    // 配置首页左划显示的星标和删除按钮
    this.setData({
      slideButtons: [{
        extClass: 'starBtn',
        text: '星标',
        src: '../../images/list/star.png'
      }, {
        type: 'warn',
        text: '删除',
        src: '../../images/list/trash.png'
      }],
    })
  },

  // 响应左划按钮事件
  async slideButtonTap(e) {
    // 得到触发事件的上架序号
    const {index} = e.detail
    // 根据序号获得上架对象
    const itemIndex = e.currentTarget.dataset.index
    const item = this.data.unboughtItems[itemIndex]
    const db = await getApp().database()
    getApp().getOpenId().then(async openid => {
      if(item._openid === openid){
        // 处理星标按钮点击事件
        if (index === 0) {
          // 根据上架的 _id 找到并反转星标标识
          db.collection(getApp().globalData.collectionMarketList).where({
            _id: item._id
          }).update({
            data: {
              star: !item.star
            }
          })
          // 更新本地数据，触发显示更新
          item.star = !item.star
          this.setData({
            unboughtItems: this.data.unboughtItems
          })
        }
        
        // 处理删除按钮点击事件
        if (index === 1) {
          // 根据上架的 _id 找到并删除上架记录
          db.collection(getApp().globalData.collectionMarketList).where({
            _id: item._id
          }).remove()
          // 更新本地数据，快速更新显示
          this.data.unboughtItems.splice(itemIndex, 1)
          this.setData({
            unboughtItems: this.data.unboughtItems
          })
          // 如果删除完所有商品，刷新数据，让页面显示无商品图片
          if (this.data.unboughtItems.length === 0 && this.data.boughtItems.length === 0) {
            this.setData({
              allItems: [],
              unboughtItems: [],
              boughtItems: []
            })
          }
        }
    }else{
      wx.showToast({
        title: '只能编辑自己的商品！',
        icon: 'error',
        duration: 2000
      })
    }
    })
  },

  // 响应左划按钮事件
  async slideButtonTapBottom(e) {
    // 得到触发事件的上架序号
    const {index} = e.detail
    // 根据序号获得上架对象
    const itemIndex = e.currentTarget.dataset.index
    const item = this.data.boughtItems[itemIndex]
    const db = await getApp().database()
    getApp().getOpenId().then(async openid => {
      if(item._openid === openid){
        // 处理星标按钮点击事件
        if (index === 0) {
          // 根据上架的 _id 找到并反转星标标识
          db.collection(getApp().globalData.collectionMarketList).where({
            _id: item._id
          }).update({
            data: {
              star: !item.star
            }
          })
          // 更新本地数据，触发显示更新
          item.star = !item.star
          this.setData({
            boughtItems: this.data.boughtItems
          })
        }
        
        // 处理删除按钮点击事件
        if (index === 1) {
          // 根据上架的 _id 找到并删除上架记录
          db.collection(getApp().globalData.collectionMarketList).where({
            _id: item._id
          }).remove()
          // 更新本地数据，快速更新显示
          this.data.boughtItems.splice(itemIndex, 1)
          this.setData({
            boughtItems: this.data.boughtItems
          })
          // 如果删除完所有商品，刷新数据，让页面显示无商品图片
          if (this.data.unboughtItems.length === 0 && this.data.boughtItems.length === 0) {
            this.setData({
              allItems: [],
              unboughtItems: [],
              boughtItems: []
            })
          }
        }
    }else{
      wx.showToast({
        title: '只能编辑自己的商品！',
        icon: 'error',
        duration: 2000
      })
    }
    })
  },

  async getCurrentCredit(){
    const db = await getApp().database()
    getApp().getOpenId().then(async openid => {
      db.collection(getApp().globalData.collectionUserList).where({
        _openid: openid
      }).get().then(dataGot => {
          // 将数据保存到本地、更新显示
          const {data} = dataGot
          this.data.currentCredit = data[0].credit
      })
    })
  },

  // 点击左侧单选框时，切换上架状态
  async buyItem(e) {
    // 根据序号获得触发切换事件的上架
    const itemIndex = e.currentTarget.dataset.index
    const item = this.data.unboughtItems[itemIndex]
    const db = await getApp().database()
    const _ = db.command
    getApp().getOpenId().then(async openid => {
      if(item._openid == openid){
        wx.showToast({
          title: '不能购买自己的物品！',
          icon: 'error',
          duration: 2000
        })
      }else if(this.data.currentCredit < item.price){
        wx.showToast({
          title: '没积分了...攒点吧！',
          icon: 'error',
          duration: 2000
        })
      }else{
        // 根据上架 _id，获得并更新上架商品状态
        db.collection(getApp().globalData.collectionMarketList).where({
          _id: item._id
        }).update({
          // freq == 1 表示上架已完成，不再提醒
          // freq == 0 表示上架未完成，每天提醒
          data: {
            freq: 1
          }
        })

        // Decrease Credit
        db.collection(getApp().globalData.collectionUserList).where({
          _openid: openid
        }).update({
          data: {
            credit: _.inc(-item.price)
          }
        })

        // 快速刷新数据
        item.freq = 1
        this.setData({
          unboughtItems: this.data.allItems.filter(mission => mission.freq === 0),
          boughtItems: this.data.allItems.filter(mission => mission.freq === 1)
        })
      }
    })
  },

  // 跳转响应函数
  toDetailPage(e) {
    const itemIndex = e.currentTarget.dataset.index
    const item = this.data.unboughtItems[itemIndex]
    wx.navigateTo({
      url: '../MarketDetail/index?id=' + item._id,
    })
  },

  toAddPage() {
    wx.navigateTo({
      url: '../MarketAdd/index',
    })
  }
})