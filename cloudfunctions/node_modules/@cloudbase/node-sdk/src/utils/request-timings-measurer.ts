import { ClientRequest } from 'http'

const EventEmitter = require('events').EventEmitter

export class RequestTimgingsMeasurer extends EventEmitter {
    public static new(options: any) {
        return new RequestTimgingsMeasurer(options)
    }

    private enable: boolean
    private timings: any
    private timerStarted: boolean
    private interval: number
    private waitingTime: number
    private intervalId: any
    private timeoutId: any

    private e: Error = null

    public constructor(options: any) {
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

        this.e = null
        this.enable = options.enable === true
        this.timerStarted = false
        this.intervalId = null
        this.timeoutId = null

        this.waitingTime = options.waitingTime || 1000
        this.interval = options.interval || 200
    }

    /* istanbul ignore next */
    public measure(clientRequest) {
        if (!this.enable) {
            return
        }

        this.startTimer()
        const timings = this.timings

        timings.start = Date.now()

        clientRequest
            .once('response', message => {
                timings.response = Date.now()

                timings.waiting = Date.now() - timings.start

                message.once('end', () => {
                    timings.socket = timings.socket || 0
                    // timings.lookup = timings.lookup || timings.socket
                    // timings.connect = timings.connect || timings.lookup
                    timings.download = Date.now() - timings.response
                    timings.end = Date.now() - timings.start
                    this.stopTimer('end')
                })
            })
            .once('socket', socket => {
                timings.socket = Date.now() - timings.start

                const onlookup = () => {
                    this.timings.lookup = Date.now() - this.timings.start
                }
                const onconnect = () => {
                    this.timings.connect = Date.now() - this.timings.start
                }
                const onready = () => {
                    this.timings.ready = Date.now() - this.timings.start
                }

                if (socket.connecting) {
                    socket.once('lookup', onlookup)
                    socket.once('connect', onconnect)
                    socket.once('ready', onready)
                    socket.once('error', e => {
                        socket.off('lookup', onlookup)
                        socket.off('connect', onconnect)
                        socket.off('ready', onready)
                        this.e = e
                        this.timings.error = Date.now() - this.timings.start
                        this.stopTimer(`ee:${e.message}`)
                    })
                } else {
                    this.timings.lookup = -1
                    this.timings.connect = -1
                    this.timings.ready = -1
                }
                // socket.once('data', () => {})
                // socket.once('drain', () => {})
                // socket.once('end', () => {
                //   this.stopTimer('end')
                // })
                // socket.once('timeout', () => {
                //   this.timings.timeout = Date.now() - this.timings.start
                // })
            })
            .on('error', (e: Error) => {
                this.stopTimer(`ee:${e.message}`)
            })
    }

    /* istanbul ignore next */
    private startTimer() {
        if (!this.enable) {
            return
        }

        if (this.timerStarted) {
            return
        }

        this.timerStarted = true
        this.intervalId = null
        this.timeoutId = setTimeout(() => {
            this.process('inprogress')
            this.intervalId = setInterval(() => {
                this.process('inprogress')
            }, this.interval)
        }, this.waitingTime)
    }

    /* istanbul ignore next */
    private stopTimer(reason: string) {
        // if (!this.enable) {
        //   return
        // }

        // if (!this.timerStarted) {
        //   return
        // }

        this.timerStarted = false

        clearTimeout(this.timeoutId)
        clearInterval(this.intervalId)
        this.process(reason)
    }

    /* istanbul ignore next */
    private process(reason: string) {
        this.emit('progress', { ...this.timings }, reason)
    }
}
