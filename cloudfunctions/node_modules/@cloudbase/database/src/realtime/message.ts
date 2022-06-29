import {
  IResponseMessage,
  IResponseMessageInitEventMsg
} from '../typings/realtime'

export function genRequestId(prefix: string = '') {
  return `${prefix ? `${prefix}_` : ''}${+new Date()}_${Math.random()}`
}

export function isInitEventMessage(
  msg: IResponseMessage
): msg is IResponseMessageInitEventMsg {
  return msg.msgType === 'INIT_EVENT'
}
