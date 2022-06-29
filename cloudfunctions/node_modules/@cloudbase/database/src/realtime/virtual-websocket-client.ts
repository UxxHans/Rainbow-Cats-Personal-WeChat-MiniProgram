import set from 'lodash.set'
import unset from 'lodash.unset'
import cloneDeep from 'lodash.clonedeep'
import { genRequestId } from './message'
import {
  IResponseMessage,
  IRequestMessageInitWatchMsg,
  IResponseMessageInitEventMsg,
  IDBEvent,
  IRequestMessageRebuildWatchMsg,
  IRequestMessageCloseWatchMsg,
  IRequestMsgType,
  IResponseMessageNextEventMsg,
  IRequestMessageCheckLastMsg
} from '../typings/realtime'
import {
  CloudSDKError,
  isTimeoutError,
  TimeoutError,
  CancelledError,
  isCancelledError
} from '../utils/error'
import { ERR_CODE } from '../config/error.config'
import { sleep } from '../utils/utils'
// import Reporter from "./externals/public-lib/reporter"
import { RealtimeListener } from './listener'
import { Snapshot } from './snapshot'
import { IWSSendOptions, ILoginResult } from './websocket-client'
import { isRealtimeErrorMessageError, RealtimeErrorMessageError } from './error'
import { IWatchOptions, ISingleDBEvent } from '../typings/index'

// =============== Realtime Virtual WebSocket Client (Internal) ====================

interface IVirtualWebSocketClientConstructorOptions extends IWatchOptions {
  // ws: RealtimeWebSocketClient
  envId?: string
  collectionName: string
  query: string
  limit?: number
  orderBy?: Record<string, string>
  send: <T = any>(opts: IWSSendOptions) => Promise<T>
  login: (envId?: string, refresh?: boolean) => Promise<any>
  isWSConnected: () => boolean
  onceWSConnected: () => Promise<void>
  getWaitExpectedTimeoutLength: () => number
  onWatchStart: (client: VirtualWebSocketClient, queryID: string) => void
  onWatchClose: (client: VirtualWebSocketClient, queryID: string) => void
  debug?: boolean
}

interface IWatchSessionInfo {
  queryID: string
  currentEventId: number
  currentDocs: Record<string, any>[]
  expectEventId?: number
}

interface IHandleCommonErrorOptions {
  onSignError: (e: RealtimeErrorMessageError) => void
  onTimeoutError: (e: TimeoutError) => void
  onCancelledError: (e: CancelledError) => void
  onNotRetryableError: (e: RealtimeErrorMessageError) => void
  onUnknownError: (e: any) => void
}

interface IHandleWatchEstablishmentErrorOptions {
  operationName: 'INIT_WATCH' | 'REBUILD_WATCH'
  resolve: (value?: void | PromiseLike<void> | undefined) => void
  reject: (e: any) => void
  // retry: (refreshLogin?: boolean) => void
  // abortWatch: (e: any) => void
}

enum WATCH_STATUS {
  LOGGINGIN = 'LOGGINGIN',
  INITING = 'INITING',
  REBUILDING = 'REBUILDING',
  ACTIVE = 'ACTIVE',
  ERRORED = 'ERRORED',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED',
  PAUSED = 'PAUSED',
  RESUMING = 'RESUMING'
}

const DEFAULT_WAIT_TIME_ON_UNKNOWN_ERROR = 100
const DEFAULT_MAX_AUTO_RETRY_ON_ERROR = 2
const DEFAULT_MAX_SEND_ACK_AUTO_RETRY_ON_ERROR = 2
const DEFAULT_SEND_ACK_DEBOUNCE_TIMEOUT = 10 * 1000
const DEFAULT_INIT_WATCH_TIMEOUT = 10 * 1000
const DEFAULT_REBUILD_WATCH_TIMEOUT = 10 * 1000

export class VirtualWebSocketClient {
  // passed over
  watchId: string
  private envId?: string
  private collectionName: string
  private query: string
  private limit: number
  private orderBy: Record<string, string>
  private send: <T = any>(opts: IWSSendOptions) => Promise<T>
  private login: (envId?: string, refresh?: boolean) => Promise<any>
  private isWSConnected: () => boolean
  private onceWSConnected: () => Promise<void>
  private getWaitExpectedTimeoutLength: () => number
  private onWatchStart: (
    client: VirtualWebSocketClient,
    queryID: string
  ) => void
  private onWatchClose: (
    client: VirtualWebSocketClient,
    queryID: string
  ) => void
  private debug?: boolean

  // own
  listener: RealtimeListener
  private watchStatus: WATCH_STATUS = WATCH_STATUS.INITING
  private _availableRetries: Partial<Record<IRequestMsgType, number>>
  private _ackTimeoutId?: number
  private _initWatchPromise?: Promise<void>
  private _rebuildWatchPromise?: Promise<void>

  // obtained
  private sessionInfo?: IWatchSessionInfo

  // internal
  private _waitExpectedTimeoutId?: number

  constructor(options: IVirtualWebSocketClientConstructorOptions) {
    this.watchId = `watchid_${+new Date()}_${Math.random()}`
    this.envId = options.envId
    this.collectionName = options.collectionName
    this.query = options.query
    this.limit = options.limit
    this.orderBy = options.orderBy
    this.send = options.send
    this.login = options.login
    this.isWSConnected = options.isWSConnected
    this.onceWSConnected = options.onceWSConnected
    this.getWaitExpectedTimeoutLength = options.getWaitExpectedTimeoutLength
    this.onWatchStart = options.onWatchStart
    this.onWatchClose = options.onWatchClose
    this.debug = options.debug

    this._availableRetries = {
      INIT_WATCH: DEFAULT_MAX_AUTO_RETRY_ON_ERROR,
      REBUILD_WATCH: DEFAULT_MAX_AUTO_RETRY_ON_ERROR,
      CHECK_LAST: DEFAULT_MAX_SEND_ACK_AUTO_RETRY_ON_ERROR
    }

    this.listener = new RealtimeListener({
      close: this.closeWatch,
      onChange: options.onChange,
      onError: options.onError,
      debug: this.debug,
      virtualClient: this
    })

    this.initWatch()
  }

  private _login = async (
    envId?: string,
    refresh?: boolean
  ): Promise<ILoginResult> => {
    this.watchStatus = WATCH_STATUS.LOGGINGIN
    const loginResult = await this.login(envId, refresh)
    if (!this.envId) {
      this.envId = loginResult.envId
    }
    return loginResult
  }

  private initWatch = async (forceRefreshLogin?: boolean): Promise<void> => {
    if (this._initWatchPromise) {
      return this._initWatchPromise
    }

    this._initWatchPromise = new Promise<void>(
      async (resolve, reject): Promise<void> => {
        try {
          if (this.watchStatus === WATCH_STATUS.PAUSED) {
            // if (process.env.DEBUG) {
            console.log('[realtime] initWatch cancelled on pause')
            // }
            return resolve()
          }

          const { envId } = await this._login(this.envId, forceRefreshLogin)

          // if (!this.sessionInfo) {
          //   throw new Error(`can not rebuildWatch without a successful initWatch (lack of sessionInfo)`)
          // }

          if ((this.watchStatus as WATCH_STATUS) === WATCH_STATUS.PAUSED) {
            console.log('[realtime] initWatch cancelled on pause')
            return resolve()
          }

          this.watchStatus = WATCH_STATUS.INITING

          const initWatchMsg: IRequestMessageInitWatchMsg = {
            watchId: this.watchId,
            requestId: genRequestId(),
            msgType: 'INIT_WATCH',
            msgData: {
              envId,
              collName: this.collectionName,
              query: this.query,
              limit: this.limit,
              orderBy: this.orderBy
            }
          }

          const initEventMsg = await this.send<IResponseMessageInitEventMsg>({
            msg: initWatchMsg,
            waitResponse: true,
            skipOnMessage: true,
            timeout: DEFAULT_INIT_WATCH_TIMEOUT
          })

          const { events, currEvent } = initEventMsg.msgData

          this.sessionInfo = {
            queryID: initEventMsg.msgData.queryID,
            currentEventId: currEvent - 1,
            currentDocs: []
          }

          // FIX: in initEvent message, all events have id 0, which is inconsistent with currEvent
          if (events.length > 0) {
            for (const e of events) {
              e.ID = currEvent
            }
            this.handleServerEvents(initEventMsg)
          } else {
            this.sessionInfo.currentEventId = currEvent
            const snapshot = new Snapshot({
              id: currEvent,
              docChanges: [],
              docs: [],
              type: 'init'
            })
            this.listener.onChange(snapshot)
            this.scheduleSendACK()
          }
          this.onWatchStart(this, this.sessionInfo.queryID)
          this.watchStatus = WATCH_STATUS.ACTIVE
          this._availableRetries.INIT_WATCH = DEFAULT_MAX_AUTO_RETRY_ON_ERROR
          resolve()
        } catch (e) {
          this.handleWatchEstablishmentError(e, {
            operationName: 'INIT_WATCH',
            resolve,
            reject
          })
        }
      }
    )

    let success = false

    try {
      await this._initWatchPromise
      success = true
    } finally {
      this._initWatchPromise = undefined
    }

    // if (process.env.DEBUG) {
    console.log(`[realtime] initWatch ${success ? 'success' : 'fail'}`)
    // }
  }

  private rebuildWatch = async (forceRefreshLogin?: boolean): Promise<void> => {
    if (this._rebuildWatchPromise) {
      return this._rebuildWatchPromise
    }

    this._rebuildWatchPromise = new Promise<void>(
      async (resolve, reject): Promise<void> => {
        try {
          if (this.watchStatus === WATCH_STATUS.PAUSED) {
            // if (process.env.DEBUG) {
            console.log('[realtime] rebuildWatch cancelled on pause')
            // }
            return resolve()
          }
          const { envId } = await this._login(this.envId, forceRefreshLogin)

          if (!this.sessionInfo) {
            throw new Error(
              'can not rebuildWatch without a successful initWatch (lack of sessionInfo)'
            )
          }

          if ((this.watchStatus as WATCH_STATUS) === WATCH_STATUS.PAUSED) {
            console.log('[realtime] rebuildWatch cancelled on pause')
            return resolve()
          }

          this.watchStatus = WATCH_STATUS.REBUILDING

          const rebuildWatchMsg: IRequestMessageRebuildWatchMsg = {
            watchId: this.watchId,
            requestId: genRequestId(),
            msgType: 'REBUILD_WATCH',
            msgData: {
              envId,
              collName: this.collectionName,
              queryID: this.sessionInfo.queryID,
              eventID: this.sessionInfo.currentEventId
            }
          }

          const nextEventMsg = await this.send<IResponseMessageNextEventMsg>({
            msg: rebuildWatchMsg,
            waitResponse: true,
            skipOnMessage: false,
            timeout: DEFAULT_REBUILD_WATCH_TIMEOUT
          })

          this.handleServerEvents(nextEventMsg)

          this.watchStatus = WATCH_STATUS.ACTIVE
          this._availableRetries.REBUILD_WATCH = DEFAULT_MAX_AUTO_RETRY_ON_ERROR
          resolve()
        } catch (e) {
          this.handleWatchEstablishmentError(e, {
            operationName: 'REBUILD_WATCH',
            resolve,
            reject
          })
        }
      }
    )

    let success = false

    try {
      await this._rebuildWatchPromise
      success = true
    } finally {
      this._rebuildWatchPromise = undefined
    }

    // if (process.env.DEBUG) {
    console.log(`[realtime] rebuildWatch ${success ? 'success' : 'fail'}`)
    // }
  }

  private handleWatchEstablishmentError = async (
    e: any,
    options: IHandleWatchEstablishmentErrorOptions
  ) => {
    const isInitWatch = options.operationName === 'INIT_WATCH'

    const abortWatch = () => {
      // mock temp comment
      this.closeWithError(
        new CloudSDKError({
          errCode: isInitWatch
            ? (ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_INIT_WATCH_FAIL as string)
            : (ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_REBUILD_WATCH_FAIL as string),
          errMsg: e
        })
      )
      options.reject(e)
    }

    const retry = (refreshLogin?: boolean) => {
      if (this.useRetryTicket(options.operationName)) {
        if (isInitWatch) {
          this._initWatchPromise = undefined
          options.resolve(this.initWatch(refreshLogin))
        } else {
          this._rebuildWatchPromise = undefined
          options.resolve(this.rebuildWatch(refreshLogin))
        }
      } else {
        abortWatch()
      }
    }

    this.handleCommonError(e, {
      onSignError: () => retry(true),
      onTimeoutError: () => retry(false),
      onNotRetryableError: abortWatch,
      onCancelledError: options.reject,
      onUnknownError: async () => {
        try {
          const onWSDisconnected = async () => {
            this.pause()
            await this.onceWSConnected()
            retry(true)
          }

          if (!this.isWSConnected()) {
            await onWSDisconnected()
          } else {
            await sleep(DEFAULT_WAIT_TIME_ON_UNKNOWN_ERROR)
            if (this.watchStatus === WATCH_STATUS.PAUSED) {
              // cancel
              options.reject(
                new CancelledError(
                  `${options.operationName} cancelled due to pause after unknownError`
                )
              )
            } else if (!this.isWSConnected()) {
              await onWSDisconnected()
            } else {
              retry(false)
            }
          }
        } catch (e) {
          // unexpected error while handling error, in order to provide maximum effort on SEAMINGLESS FAULT TOLERANCE, just retry
          retry(true)
        }
      }
    })
  }

  private closeWatch = async () => {
    const queryId = this.sessionInfo ? this.sessionInfo.queryID : ''

    if (this.watchStatus !== WATCH_STATUS.ACTIVE) {
      this.watchStatus = WATCH_STATUS.CLOSED
      this.onWatchClose(this, queryId)
      return
    }

    try {
      this.watchStatus = WATCH_STATUS.CLOSING

      const closeWatchMsg: IRequestMessageCloseWatchMsg = {
        watchId: this.watchId,
        requestId: genRequestId(),
        msgType: 'CLOSE_WATCH',
        msgData: null
      }

      await this.send<void>({
        msg: closeWatchMsg
      })

      this.sessionInfo = undefined
      this.watchStatus = WATCH_STATUS.CLOSED
    } catch (e) {
      this.closeWithError(
        new CloudSDKError({
          errCode: ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_CLOSE_WATCH_FAIL as string,
          errMsg: e
        })
      )
    } finally {
      this.onWatchClose(this, queryId)
    }
  }

  private scheduleSendACK = () => {
    this.clearACKSchedule()

    // TODO: should we check status after timeout
    // @ts-ignore
    this._ackTimeoutId = setTimeout(() => {
      if (this._waitExpectedTimeoutId) {
        this.scheduleSendACK()
      } else {
        this.sendACK()
      }
    }, DEFAULT_SEND_ACK_DEBOUNCE_TIMEOUT)
  }

  private clearACKSchedule = () => {
    if (this._ackTimeoutId) {
      clearTimeout(this._ackTimeoutId)
    }
  }

  private sendACK = async (): Promise<void> => {
    try {
      if (this.watchStatus !== WATCH_STATUS.ACTIVE) {
        this.scheduleSendACK()
        return
      }

      if (!this.sessionInfo) {
        console.warn(
          '[realtime listener] can not send ack without a successful initWatch (lack of sessionInfo)'
        )
        return
      }

      const ackMsg: IRequestMessageCheckLastMsg = {
        watchId: this.watchId,
        requestId: genRequestId(),
        msgType: 'CHECK_LAST',
        msgData: {
          queryID: this.sessionInfo.queryID,
          eventID: this.sessionInfo.currentEventId
        }
      }

      await this.send<void>({
        msg: ackMsg
      })

      this.scheduleSendACK()
    } catch (e) {
      // TODO: refactor
      if (isRealtimeErrorMessageError(e)) {
        const msg = e.payload
        switch (msg.msgData.code) {
          // signature error -> retry with refreshed signature
          case 'CHECK_LOGIN_FAILED':
          case 'SIGN_EXPIRED_ERROR':
          case 'SIGN_INVALID_ERROR':
          case 'SIGN_PARAM_INVALID': {
            this.rebuildWatch()
            return
          }
          // other -> throw
          case 'QUERYID_INVALID_ERROR':
          case 'SYS_ERR':
          case 'INVALIID_ENV':
          case 'COLLECTION_PERMISSION_DENIED': {
            // must throw
            this.closeWithError(
              new CloudSDKError({
                errCode: ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_CHECK_LAST_FAIL as string,
                errMsg: msg.msgData.code
              })
            )
            return
          }
          default: {
            break
          }
        }
      }

      // maybe retryable
      if (
        this._availableRetries.CHECK_LAST &&
        this._availableRetries.CHECK_LAST > 0
      ) {
        this._availableRetries.CHECK_LAST--
        this.scheduleSendACK()
      } else {
        this.closeWithError(
          new CloudSDKError({
            errCode: ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_CHECK_LAST_FAIL as string,
            errMsg: e
          })
        )
      }
    }
  }

  private handleCommonError = (
    e: any,
    options: IHandleCommonErrorOptions
  ): void => {
    if (isRealtimeErrorMessageError(e)) {
      const msg = e.payload
      switch (msg.msgData.code) {
        // signature error -> retry with refreshed signature
        case 'CHECK_LOGIN_FAILED':
        case 'SIGN_EXPIRED_ERROR':
        case 'SIGN_INVALID_ERROR':
        case 'SIGN_PARAM_INVALID': {
          options.onSignError(e)
          return
        }
        // not-retryable error -> throw
        case 'QUERYID_INVALID_ERROR':
        case 'SYS_ERR':
        case 'INVALIID_ENV':
        case 'COLLECTION_PERMISSION_DENIED': {
          options.onNotRetryableError(e)
          return
        }
        default: {
          options.onNotRetryableError(e)
          return
        }
      }
    } else if (isTimeoutError(e)) {
      // timeout error
      options.onTimeoutError(e)
      return
    } else if (isCancelledError(e)) {
      // cancelled error
      options.onCancelledError(e)
      return
    }

    // unknown error
    options.onUnknownError(e)
  }

  // credit a retry chance from availableRetries
  private useRetryTicket(operationName: IRequestMsgType): boolean {
    if (
      this._availableRetries[operationName] &&
      this._availableRetries[operationName]! > 0
    ) {
      this._availableRetries[operationName]!--

      // if (process.env.DEBUG) {
      console.log(
        `[realtime] ${operationName} use a retry ticket, now only ${this._availableRetries[operationName]} retry left`
      )
      // }

      return true
    }
    return false
  }

  private async handleServerEvents(
    msg: IResponseMessageInitEventMsg | IResponseMessageNextEventMsg
  ) {
    try {
      this.scheduleSendACK()
      await this._handleServerEvents(msg)
      this._postHandleServerEventsValidityCheck(msg)
    } catch (e) {
      // if (process.env.DEBUG) {
      // TODO: report
      console.error(
        '[realtime listener] internal non-fatal error: handle server events failed with error: ',
        e
      )

      // writeToFile(
      //   "wserror.txt",
      //   `[realtime listener] internal non-fatal error: handle server events failed with error:  ${JSON.stringify(
      //     Object.assign({}, e, {
      //       requestId: msg.requestId,
      //       watchId: msg.watchId
      //     })
      //   )} \n`
      // )
      // }

      throw e
    }
  }

  private async _handleServerEvents(
    msg: IResponseMessageInitEventMsg | IResponseMessageNextEventMsg
  ) {
    const { requestId } = msg

    const { events } = msg.msgData
    const { msgType } = msg

    if (!events.length || !this.sessionInfo) {
      return
    }

    const sessionInfo = this.sessionInfo

    let allChangeEvents: ISingleDBEvent[]
    try {
      allChangeEvents = events.map(getPublicEvent)
    } catch (e) {
      this.closeWithError(
        new CloudSDKError({
          errCode: ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_RECEIVE_INVALID_SERVER_DATA as string,
          errMsg: e
        })
      )
      return
    }

    // aggregate docs
    let docs = [...sessionInfo.currentDocs]
    let initEncountered = false
    for (let i = 0, len = allChangeEvents.length; i < len; i++) {
      const change = allChangeEvents[i]

      if (sessionInfo.currentEventId >= change.id) {
        if (!allChangeEvents[i - 1] || change.id > allChangeEvents[i - 1].id) {
          // duplicate event, dropable
          // TODO: report
          // if (process.env.DEBUG) {
          console.warn(
            `[realtime] duplicate event received, cur ${sessionInfo.currentEventId} but got ${change.id}`
          )
          // }
        } else {
          // allChangeEvents should be in ascending order according to eventId, this should never happens, must report a non-fatal error
          console.error(
            `[realtime listener] server non-fatal error: events out of order (the latter event's id is smaller than that of the former) (requestId ${requestId})`
          )

          // writeToFile(
          //   "wserror.txt",
          //   `[realtime listener] server non-fatal error: events out of order (the latter event's id is smaller than that of the former)  ${JSON.stringify(
          //     Object.assign(
          //       {},
          //       {
          //         requestId: msg.requestId,
          //         watchId: msg.watchId
          //       }
          //     )
          //   )} \n`
          // )
        }
        continue
      } else if (sessionInfo.currentEventId === change.id - 1) {
        // correct sequence
        // first handle dataType then queueType:
        // 1. dataType: we ONLY populate change.doc if neccessary
        // 2. queueType: we build the data snapshot

        switch (change.dataType) {
          case 'update': {
            // only need to populate change.doc when it is not provided
            if (!change.doc) {
              switch (change.queueType) {
                case 'update':
                case 'dequeue': {
                  const localDoc = docs.find(doc => doc._id === change.docId)
                  if (localDoc) {
                    // a partial update
                    const doc = cloneDeep(localDoc)

                    if (change.updatedFields) {
                      for (const fieldPath in change.updatedFields) {
                        set(doc, fieldPath, change.updatedFields[fieldPath])
                      }
                    }

                    if (change.removedFields) {
                      for (const fieldPath of change.removedFields) {
                        unset(doc, fieldPath)
                      }
                    }

                    change.doc = doc
                  } else {
                    // TODO report
                    console.error(
                      '[realtime listener] internal non-fatal server error: unexpected update dataType event where no doc is associated.'
                    )

                    // writeToFile(
                    //   "wserror.txt",
                    //   `[realtime listener] internal non-fatal server error: unexpected update dataType event where no doc is associated.  ${JSON.stringify(
                    //     Object.assign(
                    //       {},
                    //       {
                    //         requestId: msg.requestId,
                    //         watchId: msg.watchId
                    //       }
                    //     )
                    //   )} \n`
                    // )
                  }
                  break
                }
                case 'enqueue': {
                  // doc is provided by server, this should never occur
                  const err = new CloudSDKError({
                    errCode: ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_UNEXPECTED_FATAL_ERROR as string,
                    errMsg: `HandleServerEvents: full doc is not provided with dataType="update" and queueType="enqueue" (requestId ${msg.requestId})`
                  })
                  this.closeWithError(err)
                  throw err
                }
                default: {
                  break
                }
              }
            }
            break
          }
          case 'replace': {
            // validation
            if (!change.doc) {
              // doc is provided by server, this should never occur
              const err = new CloudSDKError({
                errCode: ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_UNEXPECTED_FATAL_ERROR as string,
                errMsg: `HandleServerEvents: full doc is not provided with dataType="replace" (requestId ${msg.requestId})`
              })
              this.closeWithError(err)
              throw err
            }
            break
          }
          case 'remove': {
            const doc = docs.find(doc => doc._id === change.docId)
            if (doc) {
              change.doc = doc
            } else {
              // TODO report
              console.error(
                '[realtime listener] internal non-fatal server error: unexpected remove event where no doc is associated.'
              )

              // writeToFile(
              //   "wserror.txt",
              //   `[realtime listener] internal non-fatal server error: unexpected remove event where no doc is associated. ${JSON.stringify(
              //     Object.assign(
              //       {},
              //       {
              //         requestId: msg.requestId,
              //         watchId: msg.watchId
              //       }
              //     )
              //   )} \n`
              // )
            }
            break
          }
          case 'limit': {
            if (!change.doc) {
              switch(change.queueType) {
                case 'dequeue': {
                  const doc = docs.find(doc => doc._id === change.docId)
                  if (doc) {
                    change.doc = doc
                  } else {
                    console.error(
                      '[realtime listener] internal non-fatal server error: unexpected limit dataType event where no doc is associated.'
                    )
                  }
                  break
                }
                case 'enqueue': {
                  // doc is provided by server, this should never occur
                  const err = new CloudSDKError({
                    errCode: ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_UNEXPECTED_FATAL_ERROR as string,
                    errMsg: `HandleServerEvents: full doc is not provided with dataType="limit" and queueType="enqueue" (requestId ${msg.requestId})`
                  })
                  this.closeWithError(err)
                  throw err
                }
                default: {
                  break
                }
              }
            }
            break
          }
        }

        switch (change.queueType) {
          case 'init': {
            if (!initEncountered) {
              initEncountered = true
              docs = [change.doc]
            } else {
              docs.push(change.doc)
            }
            break
          }
          case 'enqueue': {
            docs.push(change.doc)
            break
          }
          case 'dequeue': {
            const ind = docs.findIndex(doc => doc._id === change.docId)
            if (ind > -1) {
              docs.splice(ind, 1)
            } else {
              // TODO report
              console.error(
                '[realtime listener] internal non-fatal server error: unexpected dequeue event where no doc is associated.'
              )

              // writeToFile(
              //   "wserror.txt",
              //   `[realtime listener] internal non-fatal server error: unexpected dequeue event where no doc is associated. ${JSON.stringify(
              //     Object.assign(
              //       {},
              //       {
              //         requestId: msg.requestId,
              //         watchId: msg.watchId
              //       }
              //     )
              //   )} \n`
              // )
            }
            break
          }
          case 'update': {
            // writeToFile(
            //   "wserror.txt",
            //   `[realtime listener] docs ${JSON.stringify(
            //     docs
            //   )} change doc ${JSON.stringify(change)} \n`
            // )
            const ind = docs.findIndex(doc => doc._id === change.docId)
            if (ind > -1) {
              docs[ind] = change.doc
            } else {
              // TODO report
              console.error(
                '[realtime listener] internal non-fatal server error: unexpected queueType update event where no doc is associated.'
              )

              // writeToFile(
              //   "wserror.txt",
              //   `[realtime listener] internal non-fatal server error: unexpected queueType update event where no doc is associated. ${JSON.stringify(
              //     Object.assign(
              //       {},
              //       {
              //         requestId: msg.requestId,
              //         watchId: msg.watchId
              //       }
              //     )
              //   )} \n`
              // )
            }
            break
          }
        }

        if (
          i === len - 1 ||
          (allChangeEvents[i + 1] && allChangeEvents[i + 1].id !== change.id)
        ) {
          // a shallow slice creates a shallow snapshot
          const docsSnapshot = [...docs]

          // we slice first cause' if there're allChangeEvents that are of the same id after this change, we don't want to involve it for it is unexpected invalid order
          const docChanges = allChangeEvents
            .slice(0, i + 1)
            .filter(c => c.id === change.id)

          // all changes of this event has been handle, we could dispatch the event now
          this.sessionInfo.currentEventId = change.id
          this.sessionInfo.currentDocs = docs

          const snapshot = new Snapshot({
            id: change.id,
            docChanges,
            docs: docsSnapshot,
            msgType
          })

          // Reporter.surroundThirdByTryCatch(() =>
          this.listener.onChange(snapshot)
          // )()
        }
      } else {
        // out-of-order event
        // if (process.env.DEBUG) {
        // TODO: report
        console.warn(
          `[realtime listener] event received is out of order, cur ${this.sessionInfo.currentEventId} but got ${change.id}`
        )
        // }
        // rebuild watch
        await this.rebuildWatch()
        return
      }
    }
  }

  private _postHandleServerEventsValidityCheck(
    msg: IResponseMessageInitEventMsg | IResponseMessageNextEventMsg
  ) {
    if (!this.sessionInfo) {
      console.error(
        '[realtime listener] internal non-fatal error: sessionInfo lost after server event handling, this should never occur'
      )

      // writeToFile(
      //   "wserror.txt",
      //   `[realtime listener] internal non-fatal error: sessionInfo lost after server event handling, this should never occur ${JSON.stringify(
      //     Object.assign(
      //       {},
      //       {
      //         requestId: msg.requestId,
      //         watchId: msg.watchId
      //       }
      //     )
      //   )} \n`
      // )
      return
    }

    if (
      this.sessionInfo.expectEventId &&
      this.sessionInfo.currentEventId >= this.sessionInfo.expectEventId
    ) {
      this.clearWaitExpectedEvent()
    }

    if (this.sessionInfo.currentEventId < msg.msgData.currEvent) {
      console.warn(
        '[realtime listener] internal non-fatal error: client eventId does not match with server event id after server event handling'
      )
      return
    }
  }

  private clearWaitExpectedEvent() {
    if (this._waitExpectedTimeoutId) {
      clearTimeout(this._waitExpectedTimeoutId)
      this._waitExpectedTimeoutId = undefined
    }
  }

  onMessage(msg: IResponseMessage) {
    // watchStatus sanity check
    switch (this.watchStatus) {
      case WATCH_STATUS.PAUSED: {
        // ignore all but error message
        if (msg.msgType !== 'ERROR') {
          return
        }
        break
      }
      case WATCH_STATUS.LOGGINGIN:
      case WATCH_STATUS.INITING:
      case WATCH_STATUS.REBUILDING: {
        console.warn(
          `[realtime listener] internal non-fatal error: unexpected message received while ${this.watchStatus}`
        )
        return
      }
      case WATCH_STATUS.CLOSED: {
        console.warn(
          '[realtime listener] internal non-fatal error: unexpected message received when the watch has closed'
        )
        return
      }
      case WATCH_STATUS.ERRORED: {
        console.warn(
          '[realtime listener] internal non-fatal error: unexpected message received when the watch has ended with error'
        )
        return
      }
    }

    if (!this.sessionInfo) {
      console.warn(
        '[realtime listener] internal non-fatal error: sessionInfo not found while message is received.'
      )
      return
    }

    this.scheduleSendACK()

    switch (msg.msgType) {
      case 'NEXT_EVENT': {
        // if (process.env.DEBUG) {
        // @ts-ignore
        // if (wx._ignore) {
        console.warn(`nextevent ${msg.msgData.currEvent} ignored`, msg)
        // @ts-ignore
        // wx._ignore = false
        // return
        // }
        // }

        this.handleServerEvents(msg)
        break
      }
      case 'CHECK_EVENT': {
        if (this.sessionInfo.currentEventId < msg.msgData.currEvent) {
          // client eventID < server eventID:
          // there might be one or more pending events not yet received but sent by the server
          this.sessionInfo.expectEventId = msg.msgData.currEvent
          this.clearWaitExpectedEvent()
          // @ts-ignore
          this._waitExpectedTimeoutId = setTimeout(() => {
            // must rebuild watch
            this.rebuildWatch()
          }, this.getWaitExpectedTimeoutLength())

          // if (process.env.DEBUG) {
          console.log(
            `[realtime] waitExpectedTimeoutLength ${this.getWaitExpectedTimeoutLength()}`
          )
          // }
        }
        break
      }
      case 'ERROR': {
        // receive server error
        this.closeWithError(
          new CloudSDKError({
            errCode: ERR_CODE.SDK_DATABASE_REALTIME_LISTENER_SERVER_ERROR_MSG as string,
            errMsg: `${msg.msgData.code} - ${msg.msgData.message}`
          })
        )
        break
      }
      default: {
        // if (process.env.DEBUG) {
        console.warn(
          `[realtime listener] virtual client receive unexpected msg ${msg.msgType}: `,
          msg
        )
        // }
        break
      }
    }
  }

  closeWithError(error: any) {
    this.watchStatus = WATCH_STATUS.ERRORED
    this.clearACKSchedule()
    this.listener.onError(error)
    // Reporter.surroundThirdByTryCatch(() => this.listener.onError(error))
    this.onWatchClose(
      this,
      (this.sessionInfo && this.sessionInfo.queryID) || ''
    )

    // if (process.env.DEBUG) {
    console.log(
      `[realtime] client closed (${this.collectionName} ${this.query}) (watchId ${this.watchId})`
    )
    // }
  }

  pause() {
    this.watchStatus = WATCH_STATUS.PAUSED
    // if (process.env.DEBUG) {
    console.log(
      `[realtime] client paused (${this.collectionName} ${this.query}) (watchId ${this.watchId})`
    )
    // }
  }

  // resume() {
  //   return this.sessionInfo ? this.rebuildWatch() : this.initWatch()
  // }

  async resume(): Promise<void> {
    this.watchStatus = WATCH_STATUS.RESUMING

    // if (process.env.DEBUG) {
    console.log(
      `[realtime] client resuming with ${
        this.sessionInfo ? 'REBUILD_WATCH' : 'INIT_WATCH'
      } (${this.collectionName} ${this.query}) (${this.watchId})`
    )
    // }

    try {
      await (this.sessionInfo ? this.rebuildWatch() : this.initWatch())

      // if (process.env.DEBUG) {
      console.log(
        `[realtime] client successfully resumed (${this.collectionName} ${this.query}) (${this.watchId})`
      )
      // }
    } catch (e) {
      // if (process.env.DEBUG) {
      console.error(
        `[realtime] client resume failed (${this.collectionName} ${this.query}) (${this.watchId})`,
        e
      )
      // }
    }
  }
}

function getPublicEvent(event: IDBEvent): ISingleDBEvent {
  const e: ISingleDBEvent = {
    id: event.ID,
    dataType: event.DataType,
    queueType: event.QueueType,
    docId: event.DocID,
    doc: event.Doc && event.Doc !== '{}' ? JSON.parse(event.Doc) : undefined
  }

  if (event.DataType === 'update') {
    // @ts-ignore
    if (event.UpdatedFields) {
      e.updatedFields = JSON.parse(event.UpdatedFields)
    }
    // TODO: wait for tcb to change removedFields to RemovedFields
    // @ts-ignore
    if (event.removedFields || event.RemovedFields) {
      // @ts-ignore
      // e.removedFields = event.removedFields
      //   ? JSON.parse(event.removedFields)
      //   : JSON.parse(event.RemovedFields)
      e.removedFields = JSON.parse(event.removedFields)
    }
  }

  return e
}
