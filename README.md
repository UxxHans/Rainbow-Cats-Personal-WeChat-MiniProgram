# 云开发情侣互动小程序（做任务，攒积分，换商品）

这是使用云开发能力构建的情侣互动小程序，可以跟女朋友互动哦，其中使用了云开发三大基础能力的使用：
- 数据库：对文档型数据库进行读写
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码
  
## 部署方式
- 在左上角点击【云开发】按钮，进入云开发控制台。
- 如果没有环境则按照提示开通云开发环境
- 进入云开发环境，在【设置】页复制`环境ID`
- 在控制台数据库页，创建云开发数据库集合 'MarketList'， 'MissionList' 和 'UserList':在这个集合里面创建两个数据，里面创建两个值：_openid(string类), credit(number类)
- 右键点击 `cloudfunctions/getOpenId` 文件夹，选择云函数云端安装依赖上传
- 如果在新建项目时，小程序下有云开发环境，则会默认注入第一个环境，如果想更换为自己想要的环境，只需要将 `miniprogram/envList.js` 文件里的内容全部替换成如下，注意替换envId
``` js
module.exports = {
  envList: [{
    envId:'上述步骤中你获得的环境ID'
  }]
}
```

## 效果
![alt text](https://github.com/UxxHans/Rainbow-Cats-Personal-WeChat-MiniProgram/blob/main/Pictures/main.jpg)
