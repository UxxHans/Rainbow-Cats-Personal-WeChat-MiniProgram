const EventEmitter = require('events').EventEmitter

class RequestTimgingsMeasurer extends EventEmitter {
  static new(options) {
    return new RequestTimgingsMeasurer(options)
  }

  constructor(options) {
    super()

    this.timings = {
      // start: 0,
      // lookup: -1,
      // connect: -1,
      // ready: -1,
      // waiting: -1,
      // download: -1,
      // end: -1
    }

    this.enable = options.enable === true
    this.timerStarted = false
    this.intervalId = null
    this.timeoutId = null

    this.waitingTime = options.waitingTime || 1000
    this.interval = options.interval || 200
  }

  _startTimer() {
    if (!this.enable) {
      return
    }

    if (this.timerStarted) {
      return
    }

    this.timerStarted = true
    this.intervalId = null
    this.timeoutId = setTimeout(() => {
      this._process()
      this.intervalId = setInterval(() => {
        this._process()
      }, this.interval)
    }, this.waitingTime)
  }

  _stopTimer() {
    if (!this.enable) {
      return
    }

    if (!this.timerStarted) {
      return
    }

    this.timerStarted = false

    clearTimeout(this.timeoutId)
    clearInterval(this.intervalId)
    this._process()
  }

  _process() {
    this.emit('progress', { ...this.timings })
  }

  measure(clientRequest) {
    if (!this.enable) {
      return
    }

    this._startTimer()
    const timings = this.timings

    timings.start = Date.now()

    clientRequest
      .on('response', message => {
        timings.response = Date.now()

        timings.waiting = Date.now() - timings.start

        message.on('end', () => {
          timings.socket = timings.socket || 0
          // timings.lookup = timings.lookup || timings.socket
          // timings.connect = timings.connect || timings.lookup
          timings.download = Date.now() - timings.response
          timings.end = Date.now() - timings.start

          this._stopTimer()
        })
      })
      .on('socket', socket => {
        timings.socket = Date.now() - timings.start
        if (socket.connecting) {
          socket.on('lookup', () => {
            timings.lookup = Date.now() - timings.start
          })
          socket.on('connect', () => {
            timings.connect = Date.now() - timings.start
          })
          socket.on('ready', () => {
            timings.ready = Date.now() - timings.start
          })
          // socket.on('data', () => {})
          // socket.on('drain', () => {})
          // socket.on('end', () => {
          //   // this._stopTimer()
          // })
          socket.on('error', () => {
            timings.error = Date.now() - timings.start
          })
        }
      })
  }
}

exports.RequestTimgingsMeasurer = RequestTimgingsMeasurer
