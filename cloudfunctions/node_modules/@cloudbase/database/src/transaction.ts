import { EJSON } from 'bson'
import { DocumentReference } from './document'
import { Db } from './index'

class DocumentSnapshot {
  private _data: any
  requestId: string
  constructor(data, requestId) {
    this._data = data
    this.requestId = requestId
  }

  data() {
    return this._data
  }
}

const START = 'database.startTransaction'
const COMMIT = 'database.commitTransaction'
const ABORT = 'database.abortTransaction'
const GET_DOC = 'database.getInTransaction'
const UPDATE_DOC = 'database.updateDocInTransaction'
const DELETE_DOC = 'database.deleteDocInTransaction'

interface TransactionAPI {
  send(interfaceName: string, param?: any)
}

export class Transaction {
  private _id: string

  private _db: Db

  private _request: TransactionAPI

  public constructor(db: Db) {
    this._db = db
    this._request = new Db.reqClass(this._db.config)
  }

  async init(): Promise<void> {
    const res = await this._request.send(START, {})
    if (res.code) {
      throw res
    }
    this._id = res.transactionId
  }

  async get(documentRef: DocumentReference): Promise<DocumentSnapshot> {
    const param = {
      collectionName: documentRef._coll,
      transactionId: this._id,
      _id: documentRef.id
    }
    const res = await this._request.send(GET_DOC, param)
    if (res.code) throw res
    return new DocumentSnapshot(EJSON.parse(res.data), res.requestId)
  }

  async set(documentRef: DocumentReference, data: Object): Promise<SetResult> {
    const param = {
      collectionName: documentRef._coll,
      transactionId: this._id,
      _id: documentRef.id,
      data: EJSON.stringify(data, { relaxed: false }),
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

  async update(documentRef: DocumentReference, data: Object): Promise<UpdateResult> {
    const param = {
      collectionName: documentRef._coll,
      transactionId: this._id,
      _id: documentRef.id,
      data: EJSON.stringify(
        {
          $set: data
        },
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

  async delete(documentRef: DocumentReference): Promise<DeleteResult> {
    const param = {
      collectionName: documentRef._coll,
      transactionId: this._id,
      _id: documentRef.id
    }

    const res: DeleteResult | TcbError = await this._request.send(DELETE_DOC, param)
    if ((res as TcbError).code) throw res
    return {
      ...res,
      deleted: EJSON.parse((res as DeleteResult).deleted)
    }
  }

  async commit(): Promise<CommitResult> {
    const param = {
      transactionId: this._id
    }
    const res: CommitResult | TcbError = await this._request.send(COMMIT, param)
    if ((res as TcbError).code) throw res
    return res as CommitResult
  }

  async rollback(): Promise<RollbackResult> {
    const param = {
      transactionId: this._id
    }
    const res: RollbackResult | TcbError = await this._request.send(ABORT, param)
    if ((res as TcbError).code) throw res
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
): Promise<void> {
  if (times <= 0) {
    throw new Error('Transaction failed')
  }
  try {
    const transaction = new Transaction(this)
    await transaction.init()
    await callback(transaction)
    await transaction.commit()
  } catch (error) {
    console.log(error)
    return runTransaction.bind(this)(callback, --times)
  }
}

type JsonString = string

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

interface UpdateResult {
  requestId: string
  updated: number
}

interface SetResult extends UpdateResult {
  upserted: JsonString
}

interface DeleteResult {
  requestId: string
  deleted: number | string
}
