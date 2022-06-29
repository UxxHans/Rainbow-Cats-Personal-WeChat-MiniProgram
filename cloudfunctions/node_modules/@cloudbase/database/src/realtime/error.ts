import { IResponseMessageErrorMsg } from '../typings/realtime'

export class RealtimeErrorMessageError extends Error {
  isRealtimeErrorMessageError = true
  payload: IResponseMessageErrorMsg

  constructor(serverErrorMsg: IResponseMessageErrorMsg) {
    super(
      `Watch Error ${JSON.stringify(serverErrorMsg.msgData)} (requestid: ${
        serverErrorMsg.requestId
      })`
    )
    this.payload = serverErrorMsg
  }
}

export const isRealtimeErrorMessageError = (
  e: any
): e is RealtimeErrorMessageError => e && e.isRealtimeErrorMessageError
