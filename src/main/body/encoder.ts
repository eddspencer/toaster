import { DataBuffer, AvgDataBuffer } from '../utils/databuffer'
import { Observer, IntervalObserver } from '../utils/observer'

enum State { HI, LOW }

export class Encoder {
  private state: State = null
  private counter: number = 0

  constructor(
    private threshold: number = 0.5,
    private buff: DataBuffer<number> = new AvgDataBuffer(10),
    private observer: Observer = new IntervalObserver(20)
  ) { }

  reset(): void {
    this.buff.clear()
    this.state = null
    this.counter = 0
  }

  addRawProvider(provider: () => number) {
    this.observer.subscribe(() => {
      const raw = provider()
      this.addRaw(raw)

      // When buffer is full calulate the ticks      
      if (this.buff.length >= this.buff.maxSize) {
        this.calculate()
      }
    })
  }

  start(): void {
    this.observer.start()
  }

  stop(): void {
    this.observer.stop()
  }

  addRaw(raw: number): void {
    this.buff.addRaw(raw)
  }

  calculate() {
    const current = this.buff.read()
     
    // Do not do anything if there is no data in the buffer
    if (this.buff.length != 0) {
      this.buff.clear()

      if (this.state != null) {
        // Only count transition from LOW to HIGH as tick
        if (current >= this.threshold && this.state != State.HI) {
          this.counter++
        }
      }
      this.state = current >= this.threshold ? State.HI : State.LOW
    }
  }
  
  ticks(): number {
    return this.counter
  }
}