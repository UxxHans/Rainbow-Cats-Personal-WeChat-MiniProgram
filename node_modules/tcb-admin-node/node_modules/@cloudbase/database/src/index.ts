import { Point } from './geo/point'
import * as Geo from './geo/index'
import { CollectionReference } from './collection'
import { Command } from './command'
import { ServerDateConstructor } from './serverDate/index'
import { RegExpConstructor } from './regexp/index'
import { startTransaction, runTransaction } from './transaction/index'
import { LogicCommand } from './commands/logic'
import { QueryCommand } from './commands/query'
import { UpdateCommand } from './commands/update'

/**
 * 地理位置类型
 */
interface GeoTeyp {
  Point: typeof Point
}

export { Query } from './query'
export { CollectionReference } from './collection'
export { DocumentReference } from './document'

/**
 * 数据库模块
 *
 * @author haroldhu
 */
export class Db {
  /**
   * Geo 类型
   */
  Geo: GeoTeyp

  /**
   * 逻辑操作的命令
   */
  command: typeof Command

  RegExp: any

  serverDate: any

  startTransaction: any

  runTransaction: any

  logicCommand: any

  updateCommand: any

  queryCommand: any

  /**
   * 初始化
   *
   * 默认是 `default` 数据库，为今后扩展使用
   *
   * @param config
   */
  config: any

  static ws: any

  static reqClass: any

  static wsClass: any

  // 创建签名的工具函数，由jssdk传入
  static createSign: Function

  static getAccessToken: Function
  // 由jssdk传入
  static dataVersion: string
  // 运行环境，由jssdk传入
  static runtime: string
  // 应用签名信息，由jssdk传入
  static appSecretInfo: any

  constructor(config?: any) {
    this.config = config
    this.Geo = Geo
    this.serverDate = ServerDateConstructor
    this.command = Command
    this.RegExp = RegExpConstructor
    this.startTransaction = startTransaction
    this.runTransaction = runTransaction

    // 暴露command类 给新sdk灰度兼容用
    this.logicCommand = LogicCommand
    this.updateCommand = UpdateCommand
    this.queryCommand = QueryCommand
  }

  /**
   * 获取集合的引用
   *
   * @param collName - 集合名称
   */
  collection(collName: string): CollectionReference {
    if (!collName) {
      throw new Error('Collection name is required')
    }
    return new CollectionReference(this, collName)
  }

  /**
   * 创建集合
   */
  createCollection(collName: string) {
    let request = new Db.reqClass(this.config)

    const params = {
      collectionName: collName
    }

    return request.send('database.addCollection', params)
  }
}
