export interface Observer {
  start()
  subscribe(subscriber: () => void)
  stop()
}

/**
 * Observer that simple calls subscriber count number of times, useful for testing 
 */
export class CountObserver implements Observer {
  private subscriber: () => void
  constructor(private count: number) { }

  subscribe(subscriber: () => void) {
    this.subscriber = subscriber
  }

  start() {
    if (null != this.subscriber) {
      for (var i = 0; i < this.count; i++) {
        this.subscriber()
      }
    }
  }

  stop() {
    this.subscriber = null
  }
}

/**
 * Observer that calls subscribers at each interval
 */
export class IntervalObserver implements Observer {
  private id: number
  private total: number = 0
  private subscribers: Array<(number) => void> = []

  constructor(private interval: number) { }

  subscribe(subscriber: (time: number) => void) {
    this.subscribers.push(subscriber)
  }

  start() {
    this.id = setInterval(() => {
      this.total += this.interval
      this.subscribers.forEach(s => {
        s(this.total)
      })
    }, this.interval)
  }

  stop() {
    clearInterval(this.id)
  }
}