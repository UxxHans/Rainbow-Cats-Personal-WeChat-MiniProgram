import { VirtualWebSocketClient } from './virtual-websocket-client'
import {
  IRealtimeListenerConstructorOptions,
  DBRealtimeListener
} from '../typings/index'

// =============== Realtime Listener (Public) ====================

interface IRealtimeListenerOptions extends IRealtimeListenerConstructorOptions {
  // init
  close: () => void
  // debug
  debug?: boolean
  virtualClient?: VirtualWebSocketClient
}

export class RealtimeListener implements DBRealtimeListener {
  close: () => void
  onChange: (res: any) => void
  onError: (error: any) => void

  constructor(options: IRealtimeListenerOptions) {
    this.close = options.close
    this.onChange = options.onChange
    this.onError = options.onError

    if (options.debug) {
      Object.defineProperty(this, 'virtualClient', {
        get: () => {
          return options.virtualClient
        }
      })
    }
  }
}
