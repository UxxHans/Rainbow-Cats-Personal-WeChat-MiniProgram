// import { Db } from './index'
import { Transaction } from './index'
import { DocumentReference } from './document'
import { Query } from './query'

// import Aggregation from './aggregate'

/**
 * 集合模块，继承 Query 模块
 *
 * @author haroldhu
 */
export class CollectionReference extends Query {
  /**
   * 初始化
   *
   * @internal
   *
   * @param db    - 数据库的引用
   * @param coll  - 集合名称
   */
  /* eslint-disable no-useless-constructor */
  constructor(transaction: Transaction, coll: string) {
    super(transaction, coll)
  }

  /**
   * 读取集合名字
   */
  get name() {
    return this._coll
  }

  /**
   * 获取文档的引用
   *
   * @param docID - 文档ID
   */
  doc(docID?: string | number): DocumentReference {
    if (typeof docID !== 'string' && typeof docID !== 'number') {
      throw new Error('docId必须为字符串或数字')
    }
    return new DocumentReference(this._transaction, this._coll, docID)
  }

  /**
   * 添加一篇文档
   *
   * @param data - 数据
   */
  add(data: any): Promise<any> {
    let docID
    if (data._id !== undefined) {
      docID = data._id
    }

    let docRef = new DocumentReference(this._transaction, this._coll, docID)
    return docRef.create(data)
  }
}
