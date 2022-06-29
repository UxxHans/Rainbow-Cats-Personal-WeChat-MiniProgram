import { Transaction } from './index'
import { EJSON } from 'bson'
import { ERRORS } from '../const/code'
import { UpdateSerializer } from '../serializer/update'
import { serialize } from '../serializer/datatype'
import { Util } from '../util'

// class DocumentSnapshot {
//   private _data: any
//   requestId: string
//   constructor(data, requestId) {
//     this._data = data
//     this.requestId = requestId
//   }

//   data() {
//     return this._data
//   }
// }

interface GetResult {
  requestId: string
  data: any
}

interface UpdateResult {
  requestId: string
  updated: number
}

type JsonString = string

interface SetResult extends UpdateResult {
  upserted: JsonString
}

interface DeleteResult {
  requestId: string
  deleted: number | string
}

interface TransactionAPI {
  send(interfaceName: string, param?: any)
}

interface TcbError {
  requestId: string
  code: string
  message: string
  stack?: string
}

const GET_DOC = 'database.getInTransaction'
const UPDATE_DOC = 'database.updateDocInTransaction'
const DELETE_DOC = 'database.deleteDocInTransaction'
const INSERT_DOC = 'database.insertDocInTransaction'

/**
 * 文档模块
 *
 * @author haroldhu
 */
export class DocumentReference {
  /**
   * 文档ID
   */
  readonly id: string | number

  /**
   * 集合名称
   *
   * @internal
   */
  readonly _coll: string

  /**
   * 请求方法
   *
   * @internal
   */
  private _request: TransactionAPI
  /**
   *
   *
   * @private
   * @type {Transaction}
   * @memberof DocumentReference
   */
  private _transaction: Transaction

  private _transactionId: string

  /**
   * 初始化
   *
   * @internal
   *
   * @param transaction    - 事务的引用
   * @param coll  - 集合名称
   * @param docID - 文档ID
   */
  constructor(transaction: Transaction, coll: string, docID: string | number) {
    this._coll = coll
    this.id = docID
    this._transaction = transaction
    this._request = this._transaction.getRequestMethod()
    this._transactionId = this._transaction.getTransactionId()
  }

  async create(data: any): Promise<any> {
    let params = {
      collectionName: this._coll,
      transactionId: this._transactionId,
      data: EJSON.stringify(serialize(data), { relaxed: false })
    }

    if (this.id) {
      params['_id'] = this.id
    }

    const res = await this._request.send(INSERT_DOC, params)
    if (res.code) {
      throw res
    }

    const inserted = EJSON.parse(res.inserted)
    const ok = EJSON.parse(res.ok)

    if (ok == 1 && inserted == 1) {
      return {
        ...res,
        ok,
        inserted
      }
    } else {
      throw new Error(ERRORS.INSERT_DOC_FAIL.message)
    }
  }

  async get(): Promise<GetResult> {
    const param = {
      collectionName: this._coll,
      transactionId: this._transactionId,
      query: {
        _id: { $eq: this.id }
      }
    }
    const res = await this._request.send(GET_DOC, param)
    if (res.code) throw res
    return {
      data: res.data !== 'null' ? Util.formatField(EJSON.parse(res.data)) : EJSON.parse(res.data),
      requestId: res.requestId
    }
  }

  async set(data: Object): Promise<SetResult> {
    const param = {
      collectionName: this._coll,
      transactionId: this._transactionId,
      query: {
        _id: { $eq: this.id }
      },
      data: EJSON.stringify(serialize(data), { relaxed: false }),
      upsert: true
    }

    const res: SetResult | TcbError = await this._request.send(UPDATE_DOC, param)
    if ((res as TcbError).code) throw res
    return {
      ...res,
      updated: EJSON.parse((res as SetResult).updated),
      upserted: (res as SetResult).upserted
        ? JSON.parse((res as SetResult).upserted as string)
        : null
    }
  }

  async update(data: Object): Promise<UpdateResult> {
    const param = {
      collectionName: this._coll,
      transactionId: this._transactionId,
      query: {
        _id: { $eq: this.id }
      },
      data: EJSON.stringify(
        // {
        //   $set: UpdateSerializer.encode(data)
        // },
        UpdateSerializer.encode(data),
        {
          relaxed: false
        }
      )
    }

    const res = await this._request.send(UPDATE_DOC, param)
    if (res.code) throw res
    return {
      ...res,
      updated: EJSON.parse(res.updated)
    }
  }

  async delete(): Promise<DeleteResult> {
    const param = {
      collectionName: this._coll,
      transactionId: this._transactionId,
      query: {
        _id: { $eq: this.id }
      }
    }

    const res: DeleteResult | TcbError = await this._request.send(DELETE_DOC, param)
    if ((res as TcbError).code) throw res
    return {
      ...res,
      deleted: EJSON.parse((res as DeleteResult).deleted)
    }
  }
}
