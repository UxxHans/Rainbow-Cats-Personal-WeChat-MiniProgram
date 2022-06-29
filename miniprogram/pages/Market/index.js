Page({
  data: {
    screenWidth: 1000,
    screenHeight: 1000,

    search: "",
    credit: 0,
    user: "",

    allItems: [], //所有商品
    unboughtItems: [], //上架商品
    boughtItems: [], //下架商品

    _openidA : getApp().globalData._openidA,
    _openidB : getApp().globalData._openidB,

    slideButtons: [
      {extClass: 'buyBtn', text: '购买', src: "Images/icon_buy.svg"},
      {extClass: 'starBtn', text: '星标', src: "Images/icon_star.svg"},
      {extClass: 'removeBtn', text: '删除', src: 'Images/icon_del.svg'}
    ],
  },

  //页面加载时运行
  async onShow(){
    this.getCurrentCredit()
    this.getUser()
    await wx.cloud.callFunction({name: 'getList', data: {list: getApp().globalData.collectionMarketList}}).then(data => {
      this.setData({allItems: data.result.data})
      this.filterItem()
      this.getScreenSize()
    })
  },

  async getUser(){
    await wx.cloud.callFunction({name: 'getOpenId'}).then(res => {
        if(res.result === getApp().globalData._openidA){
            this.setData({
                user: getApp().globalData.userA,
            })
        }else if(res.result === getApp().globalData._openidB){
            this.setData({
                user: getApp().globalData.userB,
            })
        }
    })
  },

  //获取当前账号积分数额
  async getCurrentCredit(){
    await wx.cloud.callFunction({name: 'getOpenId'})
    .then(async openid => {
      await wx.cloud.callFunction({name: 'getElementByOpenId', data: {list: getApp().globalData.collectionUserList, _openid: openid.result}})
      .then(async res => {
        this.setData({
          credit: res.result.data[0].credit
        }) 
      })
    })
  },

  //获取页面大小
  async getScreenSize(){
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          screenWidth: res.windowWidth,
          screenHeight: res.windowHeight
        })
      }
    })
  },

  //转到商品详情
  async toDetailPage(element, isUpper) {
    const itemIndex = element.currentTarget.dataset.index
    const item = isUpper ? this.data.unboughtItems[itemIndex] : this.data.boughtItems[itemIndex]
    wx.navigateTo({url: '../MarketDetail/index?id=' + item._id})
  },
  //转到商品详情[上]
  async toDetailPageUpper(element) {
    this.toDetailPage(element, true)
  },  
  //转到商品详情[下]
  async toDetailPageLower(element) {
    this.toDetailPage(element, false)
  },
  //转到添加商品
  async toAddPage() {
    wx.navigateTo({url: '../MarketAdd/index'})
  },

  //设置搜索
  onSearch(element){
    this.setData({
      search: element.detail.value
    })

    this.filterItem()
  },

  //将商品划分为：完成，未完成
  filterItem(){
    let itemList = []
    if(this.data.search != ""){
      for(let i in this.data.allItems){
        if(this.data.allItems[i].title.match(this.data.search) != null){
          itemList.push(this.data.allItems[i])
        }
      }
    }else{
      itemList = this.data.allItems
    }

    this.setData({
      unboughtItems: itemList.filter(item => item.available === true),
      boughtItems: itemList.filter(item => item.available === false),
    })
  },

  //响应左划按钮事件[上]
  async slideButtonTapUpper(element) {
    this.slideButtonTap(element, true)
  },

  //响应左划按钮事件[下]
  async slideButtonTapLower(element) {
    this.slideButtonTap(element, false)
  },

  //响应左划按钮事件逻辑
  async slideButtonTap(element, isUpper){
    //得到UI序号
    const {index} = element.detail

    //根据序号获得商品
    const itemIndex = element.currentTarget.dataset.index
    const item = isUpper === true ? this.data.unboughtItems[itemIndex] : this.data.boughtItems[itemIndex]

    await wx.cloud.callFunction({name: 'getOpenId'}).then(async openid => {
        //处理完成点击事件
        if (index === 0) {
            if(isUpper) {
                this.buyItem(element)
            }else{
                wx.showToast({
                    title: '物品已被购买',
                    icon: 'error',
                    duration: 2000
                })
            }
            
        }else if(item._openid === openid.result){
            //处理星标按钮点击事件
            if (index === 1) {
                wx.cloud.callFunction({name: 'editStar', data: {_id: item._id, list: getApp().globalData.collectionMarketList, value: !item.star}})
                //更新本地数据
                item.star = !item.star
            }
            
            //处理删除按钮点击事件
            else if (index === 2) {
                wx.cloud.callFunction({name: 'deleteElement', data: {_id: item._id, list: getApp().globalData.collectionMarketList}})
                //更新本地数据
                if(isUpper) this.data.unboughtItems.splice(itemIndex, 1) 
                else  this.data.boughtItems.splice(itemIndex, 1) 
                //如果删除完所有事项，刷新数据，让页面显示无事项图片
                if (this.data.unboughtItems.length === 0 && this.data.boughtItems.length === 0) {
                    this.setData({
                    allItems: [],
                    unboughtItems: [],
                    boughtItems: []
                    })
                }
            }

            //触发显示更新
            this.setData({boughtItems: this.data.boughtItems, unboughtItems: this.data.unboughtItems})

        //如果编辑的不是自己的商品，显示提醒
        }else{
            wx.showToast({
            title: '只能编辑自己的商品',
            icon: 'error',
            duration: 2000
            })
        }
    })
  },

  //购买商品
  async buyItem(element) {
    //根据序号获得商品
    const itemIndex = element.currentTarget.dataset.index
    const item = this.data.unboughtItems[itemIndex]

    await wx.cloud.callFunction({name: 'getOpenId'}).then(async openid => {
      //如果购买自己的物品，显示提醒
      if(item._openid === openid.result){
        wx.showToast({
          title: '不能购买自己的物品',
          icon: 'error',
          duration: 2000
        })
      //如果没有积分，显示提醒
      }else if(this.data.credit < item.credit){
        wx.showToast({
          title: '积分不足...',
          icon: 'error',
          duration: 2000
        })
      }else{
        //购买对方物品，奖金从自己账号扣除，并添加物品到自己的库里
        wx.cloud.callFunction({name: 'editAvailable', data: {_id: item._id, value: false, list: getApp().globalData.collectionMarketList}})
        wx.cloud.callFunction({name: 'editCredit', data: {_openid: openid.result, value: -item.credit, list: getApp().globalData.collectionUserList}})
        wx.cloud.callFunction({name: 'addElement', data: {
            list: getApp().globalData.collectionStorageList,
            credit: item.credit,
            title: item.title,
            desc: item.desc,
        }})
        
        //显示提示
        wx.showToast({
            title: '购买成功',
            icon: 'success',
            duration: 2000
        })

        //触发显示更新
        this.setData({
          credit: this.data.credit - item.credit
        })

        item.available = false
        this.filterItem()
      }
    })
  },
})