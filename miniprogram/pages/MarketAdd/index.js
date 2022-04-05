/* 新增上架页面 */

Page({
  // 保存编辑中上架的信息
  data: {
    title: '',
    desc: '',
    freq: 0,
    price: 0,
  },

  // 表单输入处理函数
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    })
  },
  onDescInput(e) {
    this.setData({
      desc: e.detail.value
    })
  },
  onPriceInput(e) {
    this.setData({
      price: e.detail.value
    })
  },

  // 保存上架
  async saveItem() {
    // 对输入框内容进行校验
    if (this.data.title === '') {
      wx.showToast({
        title: '标题未填写',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.title.length > 10) {
      wx.showToast({
        title: '标题过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.desc.length > 100) {
      wx.showToast({
        title: '描述过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.price <= 0) {
      wx.showToast({
        title: '一定要有价格！',
        icon: 'error',
        duration: 2000
      })
      return
    }
    
    const db = await getApp().database()
    // 在数据库中新建上架事项，并填入已编辑对信息
    db.collection(getApp().globalData.collectionMarketList).add({
      data: {
        price: Number(this.data.price),
        title: this.data.title,       // 上架标题
        desc: this.data.desc,         // 上架描述
        freq: Number(this.data.freq), // 上架完成情况（提醒频率）
        star: false
      }
    }).then(() => {
      wx.navigateBack({
        delta: 0,
      })
    })
  },

  // 重置所有表单项
  resetItem() {
    this.setData({
      title: '',
      desc: '',
      freq: 0,
      price: 0
    })
  }
})