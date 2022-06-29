Page({
    data: {
        search: "",

        allItems: [],
        unusedItems: [],
        usedItems: [],
    
        _openidA : getApp().globalData._openidA,
        _openidB : getApp().globalData._openidB,
    
        slideButtons: [
            {extClass: 'useBtn', text: '使用', src: "Images/icon_use.svg"},
            {extClass: 'starBtn', text: '星标', src: "Images/icon_star.svg"},
            {extClass: 'removeBtn', text: '删除', src: 'Images/icon_del.svg'}
        ],
    },
    
    //页面加载时运行
    async onShow(){
        await wx.cloud.callFunction({name: 'getOpenId'}).then(async res => {
            await wx.cloud.callFunction({name: 'getElementByOpenId', data: {
                list: getApp().globalData.collectionStorageList,
                _openid: res.result
            }}).then(async data => {
                this.setData({allItems: data.result.data})
                this.filterItem()
            })
        })
    },
  
    //转到物品详情
    async toDetailPage(element, isUpper) {
      const itemIndex = element.currentTarget.dataset.index
      const item = isUpper ? this.data.unusedItems[itemIndex] : this.data.usedItems[itemIndex]
      wx.navigateTo({url: '../ItemDetail/index?id=' + item._id})
    },
    //转到物品详情[上]
    async toDetailPageUpper(element) {
      this.toDetailPage(element, true)
    },  
    //转到物品详情[下]
    async toDetailPageLower(element) {
      this.toDetailPage(element, false)
    },
  
    //设置搜索
    onSearch(element){
      this.setData({
        search: element.detail.value
      })
  
      this.filterItem()
    },
  
    //将物品划分为：完成，未完成
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
        unusedItems: itemList.filter(item => item.available === true),
        usedItems: itemList.filter(item => item.available === false),
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
  
      //根据序号获得物品
      const itemIndex = element.currentTarget.dataset.index
      const item = isUpper === true ? this.data.unusedItems[itemIndex] : this.data.usedItems[itemIndex]
  
      await wx.cloud.callFunction({name: 'getOpenId'}).then(async openid => {
          //处理完成点击事件
          if (index === 0) {
              if(isUpper) {
                  this.useItem(element)
              }else{
                  wx.showToast({
                      title: '物品已被使用',
                      icon: 'error',
                      duration: 2000
                  })
              }
              
          }else if(item._openid === openid.result){
              //处理星标按钮点击事件
              if (index === 1) {
                  wx.cloud.callFunction({name: 'editStar', data: {_id: item._id, list: getApp().globalData.collectionStorageList, value: !item.star}})
                  //更新本地数据
                  item.star = !item.star
              }
              
              //处理删除按钮点击事件
              else if (index === 2) {
                  wx.cloud.callFunction({name: 'deleteElement', data: {_id: item._id, list: getApp().globalData.collectionStorageList}})
                  //更新本地数据
                  if(isUpper) this.data.unusedItems.splice(itemIndex, 1) 
                  else  this.data.usedItems.splice(itemIndex, 1) 
                  //如果删除完所有事项，刷新数据，让页面显示无事项图片
                  if (this.data.unusedItems.length === 0 && this.data.usedItems.length === 0) {
                      this.setData({
                      allItems: [],
                      unusedItems: [],
                      usedItems: []
                      })
                  }
              }
  
              //触发显示更新
              this.setData({usedItems: this.data.usedItems, unusedItems: this.data.unusedItems})
  
          //如果编辑的不是自己的物品，显示提醒
          }else{
              wx.showToast({
              title: '只能编辑自己的物品',
              icon: 'error',
              duration: 2000
              })
          }
      })
    },
  
    //购买物品
    async useItem(element) {
        //根据序号获得物品
        const itemIndex = element.currentTarget.dataset.index
        const item = this.data.unusedItems[itemIndex]
    
        //使用物品
        wx.cloud.callFunction({name: 'editAvailable', data: {_id: item._id, value: false, list: getApp().globalData.collectionStorageList}}).then(()=>{
            //显示提示
            wx.showToast({
                title: '已使用',
                icon: 'success',
                duration: 2000
            })
  
            //触发显示更新
            item.available = false
            this.filterItem()
        })
    },
  })