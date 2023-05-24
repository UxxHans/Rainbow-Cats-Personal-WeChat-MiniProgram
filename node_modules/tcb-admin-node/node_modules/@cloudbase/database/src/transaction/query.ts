import { Transaction } from './index'

/**
 * 查询模块
 *
 */
export class Query {
  /**
   * Collection name
   *
   * @internal
   */
  protected _coll: string

  protected _transaction: Transaction

  constructor(transaction: Transaction, coll: string) {
    this._coll = coll
    this._transaction = transaction
  }
}
