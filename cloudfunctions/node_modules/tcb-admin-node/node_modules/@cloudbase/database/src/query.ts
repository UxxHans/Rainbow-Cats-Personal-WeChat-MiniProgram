import { createPromiseCallback } from './lib/util'
/* eslint-disable no-unused-vars */
import { OrderByDirection, QueryType } from './constant'
import { Db } from './index'
import { Validate } from './validate'
import { Util } from './util'
// import { Command } from './command';
// import * as isRegExp from 'is-regex'
import { QuerySerializer } from './serializer/query'
import { UpdateSerializer } from './serializer/update'
// import { WSClient } from "./websocket/wsclient"
import { IWatchOptions, DBRealtimeListener } from './typings/index'
import { RealtimeWebSocketClient } from './realtime/websocket-client'
import { ErrorCode } from './constant'

interface GetRes {
  data: any[]
  requestId: string
  total: number
  limit: number
  offset: number
}

interface QueryOrder {
  field?: string
  direction?: 'asc' | 'desc'
}

interface QueryOption {
  // 查询数量
  limit?: number
  // 偏移量
  offset?: number
  // 指定显示或者不显示哪些字段
  projection?: Object
}

// interface CallbackObj {
//   success: (event: any) => void
//   fail: (err: any) => void
// }

/**
 * 查询模块
 *
 * @author haroldhu
 */
export class Query {
  /**
   * Db 的引用
   *
   * @internal
   */
  protected _db: Db

  /**
   * Collection name
   *
   * @internal
   */
  protected _coll: string

  /**
   * 过滤条件
   *
   * @internal
   */
  private _fieldFilters: Object

  /**
   * 排序条件
   *
   * @internal
   */
  private _fieldOrders: QueryOrder[]

  /**
   * 查询条件
   *
   * @internal
   */
  private _queryOptions: QueryOption

  /**
   * 原始过滤参数
   */
  // private _rawWhereParams: Object

  /**
   * 请求实例
   *
   * @internal
   */
  private _request: any

  /**
   * websocket 参数 pingTimeout
   */
  // private _pingTimeout: number

  /**
   * websocket 参数 pongTimeout
   */
  // private _pongTimeout: number

  /**
   * websocket 参数 reconnectTimeout
   */
  // private _reconnectTimeout: number

  /**
   * websocket 参数 wsURL
   */
  // private _wsURL: string

  /**
   * 初始化
   *
   * @internal
   *
   * @param db            - 数据库的引用
   * @param coll          - 集合名称
   * @param fieldFilters  - 过滤条件
   * @param fieldOrders   - 排序条件
   * @param queryOptions  - 查询条件
   */
  public constructor(
    db: Db,
    coll: string,
    fieldFilters?: Object,
    fieldOrders?: QueryOrder[],
    queryOptions?: QueryOption
    // rawWhereParams?: Object
  ) {
    this._db = db
    this._coll = coll
    this._fieldFilters = fieldFilters
    this._fieldOrders = fieldOrders || []
    this._queryOptions = queryOptions || {}
    // this._pingTimeout = 10000
    // this._pongTimeout = 5000
    // this._reconnectTimeout = 15000
    // this._rawWhereParams = rawWhereParams || {}
    // this._wsURL = "ws://localhost:3000"

    /* eslint-disable new-cap */
    this._request = new Db.reqClass(this._db.config)
  }

  /**
   * 发起请求获取文档列表
   *
   * - 默认获取集合下全部文档数据
   * - 可以把通过 `orderBy`、`where`、`skip`、`limit`设置的数据添加请求参数上
   */
  public get(callback?: any): Promise<GetRes> {
    /* eslint-disable no-param-reassign */
    callback = callback || createPromiseCallback()

    let newOder = []
    if (this._fieldOrders) {
      this._fieldOrders.forEach(order => {
        newOder.push(order)
      })
    }
    interface Param {
      collectionName: string
      query?: Object
      queryType: QueryType
      order?: string[]
      offset?: number
      limit?: number
      projection?: Object
    }
    let param: Param = {
      collectionName: this._coll,
      queryType: QueryType.WHERE
    }
    if (this._fieldFilters) {
      param.query = this._fieldFilters
    }
    if (newOder.length > 0) {
      param.order = newOder
    }
    if (this._queryOptions.offset) {
      param.offset = this._queryOptions.offset
    }
    if (this._queryOptions.limit) {
      param.limit = this._queryOptions.limit < 1000 ? this._queryOptions.limit : 1000
    } else {
      param.limit = 100
    }
    if (this._queryOptions.projection) {
      param.projection = this._queryOptions.projection
    }
    this._request
      .send('database.queryDocument', param)
      .then(res => {
        if (res.code) {
          callback(0, res)
        } else {
          const documents = Util.formatResDocumentData(res.data.list)
          const result: any = {
            data: documents,
            requestId: res.requestId
          }
          if (res.TotalCount) result.total = res.TotalCount
          if (res.Limit) result.limit = res.Limit
          if (res.Offset) result.offset = res.Offset
          callback(0, result)
        }
      })
      .catch(err => {
        callback(err)
      })

    return callback.promise
  }

  /**
   * 获取总数
   */
  public count(callback?: any) {
    callback = callback || createPromiseCallback()

    interface Param {
      collectionName: string
      query?: Object
      queryType: QueryType
    }
    let param: Param = {
      collectionName: this._coll,
      queryType: QueryType.WHERE
    }
    if (this._fieldFilters) {
      param.query = this._fieldFilters
    }
    this._request.send('database.countDocument', param).then(res => {
      if (res.code) {
        callback(0, res)
      } else {
        callback(0, {
          requestId: res.requestId,
          total: res.data.total
        })
      }
    })

    return callback.promise
  }

  /**
   * 查询条件
   *
   * @param query
   */
  public where(query: object) {
    // query校验 1. 必填对象类型  2. value 不可均为undefiend
    if (Object.prototype.toString.call(query).slice(8, -1) !== 'Object') {
      throw Error(ErrorCode.QueryParamTypeError)
    }

    const keys = Object.keys(query)

    const checkFlag = keys.some(item => {
      return query[item] !== undefined
    })

    if (keys.length && !checkFlag) {
      throw Error(ErrorCode.QueryParamValueError)
    }

    return new Query(
      this._db,
      this._coll,
      QuerySerializer.encode(query),
      this._fieldOrders,
      this._queryOptions
    )
  }

  /**
   * 设置排序方式
   *
   * @param fieldPath     - 字段路径
   * @param directionStr  - 排序方式
   */
  public orderBy(fieldPath: string, directionStr: OrderByDirection): Query {
    Validate.isFieldPath(fieldPath)
    Validate.isFieldOrder(directionStr)

    const newOrder: QueryOrder = {
      field: fieldPath,
      direction: directionStr
    }
    const combinedOrders = this._fieldOrders.concat(newOrder)

    return new Query(this._db, this._coll, this._fieldFilters, combinedOrders, this._queryOptions)
  }

  /**
   * 设置查询条数
   *
   * @param limit - 限制条数
   */
  public limit(limit: number): Query {
    Validate.isInteger('limit', limit)

    let option = { ...this._queryOptions }
    option.limit = limit

    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option)
  }

  /**
   * 设置偏移量
   *
   * @param offset - 偏移量
   */
  public skip(offset: number): Query {
    Validate.isInteger('offset', offset)

    let option = { ...this._queryOptions }
    option.offset = offset

    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option)
  }

  /**
   * 发起请求批量更新文档
   *
   * @param data 数据
   */
  public update(data: Object, callback?: any): Promise<any> {
    callback = callback || createPromiseCallback()

    if (!data || typeof data !== 'object') {
      return Promise.resolve({
        code: 'INVALID_PARAM',
        message: '参数必需是非空对象'
      })
    }

    if (data.hasOwnProperty('_id')) {
      return Promise.resolve({
        code: 'INVALID_PARAM',
        message: '不能更新_id的值'
      })
    }

    let param = {
      collectionName: this._coll,
      query: this._fieldFilters,
      queryType: QueryType.WHERE,
      // query: QuerySerializer.encode(this._fieldFilters),
      multi: true,
      merge: true,
      upsert: false,
      data: UpdateSerializer.encode(data)
      // data: Util.encodeDocumentDataForReq(data, true)
      // data: this.convertParams(data)
    }

    this._request.send('database.updateDocument', param).then(res => {
      if (res.code) {
        callback(0, res)
      } else {
        callback(0, {
          requestId: res.requestId,
          updated: res.data.updated,
          upsertId: res.data.upsert_id
        })
      }
    })

    return callback.promise
  }

  /**
   * 指定要返回的字段
   *
   * @param projection
   */
  public field(projection: any): Query {
    for (let k in projection) {
      if (projection[k]) {
        if (typeof projection[k] !== 'object') {
          projection[k] = 1
        }
      } else {
        projection[k] = 0
      }
    }

    let option = { ...this._queryOptions }
    option.projection = projection

    return new Query(this._db, this._coll, this._fieldFilters, this._fieldOrders, option)
  }

  /**
   * 条件删除文档
   */
  public remove(callback?: any) {
    callback = callback || createPromiseCallback()

    if (Object.keys(this._queryOptions).length > 0) {
      console.warn('`offset`, `limit` and `projection` are not supported in remove() operation')
    }
    if (this._fieldOrders.length > 0) {
      console.warn('`orderBy` is not supported in remove() operation')
    }
    const param = {
      collectionName: this._coll,
      query: QuerySerializer.encode(this._fieldFilters),
      queryType: QueryType.WHERE,
      multi: true
    }
    this._request.send('database.deleteDocument', param).then(res => {
      if (res.code) {
        callback(0, res)
      } else {
        callback(0, {
          requestId: res.requestId,
          deleted: res.data.deleted
        })
      }
    })

    return callback.promise
  }

  /**
   * 监听query对应的doc变化
   */
  watch = (options: IWatchOptions): DBRealtimeListener => {
    if (!Db.ws) {
      Db.ws = new RealtimeWebSocketClient({
        context: {
          appConfig: {
            docSizeLimit: 1000,
            realtimePingInterval: 10000,
            realtimePongWaitTimeout: 5000,
            request: this._request
          }
        }
      })
    }

    return (Db.ws as RealtimeWebSocketClient).watch({
      ...options,
      envId: this._db.config.env,
      collectionName: this._coll,
      query: JSON.stringify(this._fieldFilters),
      limit: this._queryOptions.limit,
      orderBy: this._fieldOrders
        ? this._fieldOrders.reduce<Record<string, string>>((acc, cur) => {
            acc[cur.field] = cur.direction
            return acc
          }, {})
        : undefined
    })
    // })
  }

  /*
  convertParams(query: object) {
    // console.log(JSON.stringify(query));
    let queryParam = {};
    if (query instanceof Command) {
      queryParam = query.parse();
    } else {
      for (let key in query) {
        if (query[key] instanceof Command || query[key] instanceof RegExp || query[key] instanceof Point) {
          queryParam = Object.assign({}, queryParam, query[key].parse(key));
        } else if (isRegExp(query[key])) {
          queryParam = {
            [key]: {
              $regex: query[key].source,
              $options: query[key].flags
            }
          };
        } else if (typeof query[key] === 'object') {
          let command = new Command();
          let tmp = {};
          command.concatKeys({ [key]: query[key] }, ', tmp);
          let keys = Object.keys(tmp)[0];
          let value = tmp[keys];
          if (value instanceof Command) {
            value = value.parse(keys);
          } else {
            value = { [keys]: value };
          }

          queryParam = Object.assign({}, queryParam, value);
        } else {
          queryParam = Object.assign({}, queryParam, { [key]: query[key] });
        }
      }
    }
    // console.log(JSON.stringify(queryParam));
    return queryParam;
  } */
}
