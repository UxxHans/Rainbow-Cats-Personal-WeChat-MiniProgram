Page({
  //保存正在编辑的商品
  data: {
    title: '',
    desc: '',
    
    credit: 0,
    maxCredit: getApp().globalData.maxCredit,
    presetIndex: 0,
    presets: [{
      name:"无预设",
      title:"",
      desc:"",
    },{
      name:"薯片",
      title:"美味薯片",
      desc:"诱人的零食，夜宵绝佳伴侣，咔嘣脆！",
    },{
      name:"洗碗券",
      title:"一次性洗碗券",
      desc:"凭此券可以让对方洗碗一次！若都有洗碗券则互相抵消。",
    },{
      name:"做家务",
      title:"一次性家务券",
      desc:"凭此券可以让对方做一次轻型家务，比如扔垃圾，打扫一个的房间，领一天外卖什么的。",
    }],
    list: getApp().globalData.collectionMarketList,
  },

  //数据输入填写表单
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
  onCreditInput(e) {
    this.setData({
      credit: e.detail.value
    })
  },
  onPresetChange(e){
    this.setData({
      presetIndex: e.detail.value,
      title: this.data.presets[e.detail.value].title,
      desc: this.data.presets[e.detail.value].desc,
    })
  },

  //保存商品
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
    if (this.data.title.length > 12) {
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
    if (this.data.credit <= 0) {
      wx.showToast({
        title: '一定要有积分',
        icon: 'error',
        duration: 2000
      })
      return
    }
    await wx.cloud.callFunction({name: 'addElement', data: this.data}).then(() => {wx.navigateBack()})
  },

  // 重置所有表单项
  resetItem() {
    this.setData({
      title: '',
      desc: '',
      credit: 0,
      presetIndex: 0,
      list: getApp().globalData.collectionMarketList,
    })
  }
})