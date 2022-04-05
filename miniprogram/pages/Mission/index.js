/* 待办列表首页 */

Page({
  // 存储请求结果
  data: {
    allMissions: [], // 用户的所有待办事项
    incompleteMissions: [], // 未完成待办事项
    finishedMissions: [], // 已完成待办事项
    kirbyOpenId : getApp().globalData.kirbyOpenId,
    deeOpenId : getApp().globalData.deeOpenId,
  },

  async onShow() {
      // 查询并展示待办列表
      const db = await getApp().database()
      db.collection(getApp().globalData.collectionMissionList).get().then(dataGot => {
        const {data} = dataGot
        // 存储查询到的数据
        this.setData({
          // data 为查询到的所有待办事项列表
          allMissions: data,
          // 通过 filter 函数，将待办事项分为未完成和已完成两部分
          incompleteMissions: data.filter(mission => mission.freq === 0),
          finishedMissions: data.filter(mission => mission.freq === 1)
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
    // 得到触发事件的待办序号
    const {index} = e.detail
    // 根据序号获得待办对象
    const missionIndex = e.currentTarget.dataset.index
    const mission = this.data.incompleteMissions[missionIndex]
    const db = await getApp().database()
    getApp().getOpenId().then(async openid => {
      if(mission._openid === openid){
        // 处理星标按钮点击事件
        if (index === 0) {
          // 根据待办的 _id 找到并反转星标标识
          db.collection(getApp().globalData.collectionMissionList).where({
            _id: mission._id
          }).update({
            data: {
              star: !mission.star
            }
          })
          // 更新本地数据，触发显示更新
          mission.star = !mission.star
          this.setData({
            incompleteMissions: this.data.incompleteMissions
          })
        }
        
        // 处理删除按钮点击事件
        if (index === 1) {
          // 根据待办的 _id 找到并删除待办记录
          db.collection(getApp().globalData.collectionMissionList).where({
            _id: mission._id
          }).remove()
          // 更新本地数据，快速更新显示
          this.data.incompleteMissions.splice(missionIndex, 1)
          this.setData({
            incompleteMissions: this.data.incompleteMissions
          })
          // 如果删除完所有事项，刷新数据，让页面显示无事项图片
          if (this.data.incompleteMissions.length === 0 && this.data.finishedMissions.length === 0) {
            this.setData({
              allMissions: [],
              incompleteMissions: [],
              finishedMissions: []
            })
          }
        }
    }else{
      wx.showToast({
        title: '只能编辑自己的任务！',
        icon: 'error',
        duration: 2000
      })
    }
    })
  },

    // 响应左划按钮事件
    async slideButtonTapBottom(e) {
      // 得到触发事件的待办序号
      const {index} = e.detail
      // 根据序号获得待办对象
      const missionIndex = e.currentTarget.dataset.index
      const mission = this.data.finishedMissions[missionIndex]
      const db = await getApp().database()
      getApp().getOpenId().then(async openid => {
        if(mission._openid === openid){
          // 处理星标按钮点击事件
          if (index === 0) {
            // 根据待办的 _id 找到并反转星标标识
            db.collection(getApp().globalData.collectionMissionList).where({
              _id: mission._id
            }).update({
              data: {
                star: !mission.star
              }
            })
            // 更新本地数据，触发显示更新
            mission.star = !mission.star
            this.setData({
              finishedMissions: this.data.finishedMissions
            })
          }
          
          // 处理删除按钮点击事件
          if (index === 1) {
            // 根据待办的 _id 找到并删除待办记录
            db.collection(getApp().globalData.collectionMissionList).where({
              _id: mission._id
            }).remove()
            // 更新本地数据，快速更新显示
            this.data.finishedMissions.splice(missionIndex, 1)
            this.setData({
              finishedMissions: this.data.finishedMissions
            })
            // 如果删除完所有事项，刷新数据，让页面显示无事项图片
            if (this.data.incompleteMissions.length === 0 && this.data.finishedMissions.length === 0) {
              this.setData({
                allMissions: [],
                incompleteMissions: [],
                finishedMissions: []
              })
            }
          }
      }else{
        wx.showToast({
          title: '只能编辑自己的任务！',
          icon: 'error',
          duration: 2000
        })
      }
      })
    },

  // 点击左侧单选框时，切换待办状态
  async finishTodo(e) {
    // 根据序号获得触发切换事件的待办
    const missionIndex = e.currentTarget.dataset.index
    const mission = this.data.incompleteMissions[missionIndex]
    const db = await getApp().database()
    const _ = db.command
    getApp().getOpenId().then(async openid => {
      if(mission._openid != openid)
      {
        // 根据待办 _id，获得并更新待办事项状态
        db.collection(getApp().globalData.collectionMissionList).where({
          _id: mission._id
        }).update({
          // freq == 1 表示待办已完成，不再提醒
          // freq == 0 表示待办未完成，每天提醒
          data: {
            freq: 1
          }
        })

        // Add Credit
        db.collection(getApp().globalData.collectionUserList).where({
          _openid: mission._openid
        }).update({
          data: {
            credit: _.inc(mission.award)
          }
        })

        // 快速刷新数据
        mission.freq = 1
        this.setData({
          incompleteMissions: this.data.allMissions.filter(mission => mission.freq === 0),
          finishedMissions: this.data.allMissions.filter(mission => mission.freq === 1)
        })
      }else{
        wx.showToast({
          title: '不能完成自己的任务！',
          icon: 'error',
          duration: 2000
        })
      }
    })
  },

  // 跳转响应函数
  toDetailPage(e) {
    const missionIndex = e.currentTarget.dataset.index
    const mission = this.data.incompleteMissions[missionIndex]
    wx.navigateTo({
      url: '../MissionDetail/index?id=' + mission._id,
    })
  },

  toAddPage() {
    wx.navigateTo({
      url: '../MissionAdd/index',
    })
  }
})