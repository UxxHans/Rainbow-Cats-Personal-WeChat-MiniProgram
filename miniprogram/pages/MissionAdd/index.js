/* 新增待办页面 */

Page({
  // 保存编辑中待办的信息
  data: {
    title: '',
    desc: '',
    freq: 0,
    award: 0
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
  onAwardInput(e) {
    this.setData({
      award: e.detail.value
    })
  },

  // 保存待办
  async saveMission() {
    // 对输入框内容进行校验
    if (this.data.title === '') {
      wx.showToast({
        title: '事项标题未填写',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.title.length > 10) {
      wx.showToast({
        title: '任务标题过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.desc.length > 100) {
      wx.showToast({
        title: '任务描述过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.award <= 0) {
      wx.showToast({
        title: '一定要有奖励！',
        icon: 'error',
        duration: 2000
      })
      return
    }
    
    const db = await getApp().database()
    // 在数据库中新建待办事项，并填入已编辑对信息
    db.collection(getApp().globalData.collectionMissionList).add({
      data: {
        award: Number(this.data.award),
        title: this.data.title,       // 待办标题
        desc: this.data.desc,         // 待办描述
        freq: Number(this.data.freq), // 待办完成情况（提醒频率）
        star: false
      }
    }).then(() => {
      wx.navigateBack({
        delta: 0,
      })
    })
  },

  // 重置所有表单项
  resetMission() {
    this.setData({
      title: '',
      desc: '',
      freq: 0,
      award: 0
    })
  }
})