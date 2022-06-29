# Aggregate.geoNear

### 1. 接口描述

功能: 将记录按照离给定点从近到远输出。

声明: `geoNear(options)`

注意事项：

> `geoNear` 必须为第一个聚合阶段
> 必须有地理位置索引。如果有多个，必须用 `key` 参数指定要使用的索引。

### 2. 输入参数

| 参数               | 类型          | 必填 | 说明                                                                                           |
| ------------------ | ------------- | ---- | ---------------------------------------------------------------------------------------------- |
| near               | GeoJSON Point | 否   | 用于判断距离的点                                                                               |
| spherical          | boolean       | 是   | 必填，值为 true                                                                                |
| limit              | number        | 是   | 限制返回记录数                                                                                 |
| maxDistance        | number        | 是   | 距离最大值                                                                                     |
| minDistance        | number        | 是   | 距离最小值                                                                                     |
| query              | document      | 是   | 要求记录必须同时满足该条件（语法同 where）                                                     |
| distanceMultiplier | number        | 是   | 返回时在距离上乘以该数字                                                                       |
| distanceField      | string        | 否   | 存放距离的输出字段名，可以用点表示法表示一个嵌套字段                                           |
| includeLocs        | string        | 是   | 列出要用于距离计算的字段，如果记录中有多个字段都是地理位置时有用                               |
| key                | string        | 是   | 选择要用的地理位置索引。如果集合由多个地理位置索引，则必须指定一个，指定的方式是指定对应的字段 |

### 3. 返回结果

| 参数 | 类型                         | 必填 | 说明     |
| ---- | ---------------------------- | ---- | -------- |
| -    | [Aggregate](../aggregate.md) | 是   | 聚合对象 |

### 4. 示例代码

假设集合 `attractions` 有如下记录：

```
{
  "_id": "geoNear.0",
  "city": "Guangzhou",
  "docType": "geoNear",
  "location": {
    "type": "Point",
    "coordinates": [
      113.30593,
      23.1361155
    ]
  },
  "name": "Canton Tower"
},
{
  "_id": "geoNear.1",
  "city": "Guangzhou",
  "docType": "geoNear",
  "location": {
    "type": "Point",
    "coordinates": [
      113.306789,
      23.1564721
    ]
  },
  "name": "Baiyun Mountain"
},
{
  "_id": "geoNear.2",
  "city": "Beijing",
  "docType": "geoNear",
  "location": {
    "type": "Point",
    "coordinates": [
      116.3949659,
      39.9163447
    ]
  },
  "name": "The Palace Museum"
},
{
  "_id": "geoNear.3",
  "city": "Beijing",
  "docType": "geoNear",
  "location": {
    "type": "Point",
    "coordinates": [
      116.2328567,
      40.242373
    ]
  },
  "name": "Great Wall"
}
```

```js
const tcb = require('@cloudbase/node-sdk')
const app = tcb.init({
  env: 'xxx'
})

const db = app.database()
const $ = db.command.aggregate
const _ = db.command

exports.main = async (event, context) => {
  const res = await db
    .collection('attractions')
    .aggregate()
    .geoNear({
      distanceField: 'distance', // 输出的每个记录中 distance 即是与给定点的距离
      spherical: true,
      near: db.Geo.Point(113.3089506, 23.0968251),
      query: {
        docType: 'geoNear'
      },
      key: 'location', // 若只有 location 一个地理位置索引的字段，则不需填
      includeLocs: 'location' // 若只有 location 一个是地理位置，则不需填
    })
    .end()
  console.log(res.data)
}
```

返回结果如下：

```
{
  "_id": "geoNear.0",
  "location": {
    "type": "Point",
    "coordinates": [
      113.30593,
      23.1361155
    ]
  },
  "docType": "geoNear",
  "name": "Canton Tower",
  "city": "Guangzhou",
  "distance": 4384.68131486958
},
{
  "_id": "geoNear.1",
  "city": "Guangzhou",
  "location": {
    "type": "Point",
    "coordinates": [
      113.306789,
      23.1564721
    ]
  },
  "docType": "geoNear",
  "name": "Baiyun Mountain",
  "distance": 6643.521654040738
},
{
  "_id": "geoNear.2",
  "docType": "geoNear",
  "name": "The Palace Museum",
  "city": "Beijing",
  "location": {
    "coordinates": [
      116.3949659,
      39.9163447
    ],
    "type": "Point"
  },
  "distance": 1894750.4414538583
},
{
  "_id": "geoNear.3",
  "docType": "geoNear",
  "name": "Great Wall",
  "city": "Beijing",
  "location": {
    "type": "Point",
    "coordinates": [
      116.2328567,
      40.242373
    ]
  },
  "distance": 1928300.3308822548
}
```
