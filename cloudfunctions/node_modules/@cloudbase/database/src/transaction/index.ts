import { Db } from '../index'
import { CollectionReference } from '../collection'
import { ERRORS } from '../const/code'

const START = 'database.startTransaction'
const COMMIT = 'database.commitTransaction'
const ABORT = 'database.abortTransaction'

interface TransactionAPI {
  send(interfaceName: string, param?: any)
}

export class Transaction {
  private _id: string

  private _db: Db

  private _request: TransactionAPI

  public aborted: boolean

  public abortReason: any

  public commited: boolean

  public inited: boolean

  public constructor(db: Db) {
    this._db = db
    this._request = new Db.reqClass(this._db.config)
    this.aborted = false
    this.commited = false
    this.inited = false
  }

  async init(): Promise<void> {
    const res = await this._request.send(START)
    if (res.code) {
      throw res
    }
    this.inited = true
    this._id = res.transactionId
  }

  /**
   * 获取集合的引用
   *
   * @param collName - 集合名称
   */
  public collection(collName: string): CollectionReference {
    if (!collName) {
      throw new Error('Collection name is required')
    }

    return new CollectionReference(this._db, collName, {}, this._id)
  }

  public getTransactionId(): string {
    return this._id
  }

  public getRequestMethod(): TransactionAPI {
    return this._request
  }

  async commit(): Promise<CommitResult> {
    const param = {
      transactionId: this._id
    }
    const res: CommitResult | TcbError = await this._request.send(COMMIT, param)
    if ((res as TcbError).code) throw res
    this.commited = true
    return res as CommitResult
  }

  async rollback(customRollbackRes): Promise<RollbackResult> {
    const param = {
      transactionId: this._id
    }
    const res: RollbackResult | TcbError = await this._request.send(ABORT, param)
    if ((res as TcbError).code) throw res
    this.aborted = true // 标记当前事务已回滚
    this.abortReason = customRollbackRes
    // if (customRollbackRes !== undefined) {
    //   // 用户自定义错误
    //   throw customRollbackRes
    // }
    return res as RollbackResult
  }
}

export async function startTransaction(): Promise<Transaction> {
  const transaction = new Transaction(this)
  await transaction.init()
  return transaction
}

export async function runTransaction(
  callback: (transaction: Transaction) => void | Promise<any>,
  times: number = 3
): Promise<any> {
  let transaction
  try {
    transaction = new Transaction(this)
    await transaction.init()

    const callbackRes = await callback(transaction)

    // 检查事务是否有回滚
    if (transaction.aborted === true) {
      throw transaction.abortReason
    }
    await transaction.commit()
    return callbackRes
  } catch (error) {
    // init失败  直接抛出
    if (transaction.inited === false) {
      throw error
    }

    const throwWithRollback = async error => {
      if (!transaction.aborted && !transaction.commited) {
        // init完成，但是未commit  且 未rollback，自动调用rollback
        try {
          await transaction.rollback()
        } catch (err) {
          // 保护数据库 释放锁而做的隐式操作
        }
        throw error
      }

      // rollback自定义返回 抛出
      if (transaction.aborted === true) {
        throw transaction.abortReason
      }

      // 正常rollback 也会 throw返回
      throw error
    }

    // 事务冲突 重试次数用完  抛出最后一次错误
    if (times <= 0) {
      await throwWithRollback(error)
    }

    if (error && error.code === ERRORS.DATABASE_TRANSACTION_CONFLICT.code) {
      return await runTransaction.bind(this)(callback, --times)
    }

    // 其他错误
    await throwWithRollback(error)
  }
}

interface CommitResult {
  requestId: string
}

interface RollbackResult {
  requestId: string
}

interface TcbError {
  requestId: string
  code: string
  message: string
  stack?: string
}
