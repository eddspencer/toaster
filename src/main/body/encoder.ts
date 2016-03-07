import { Sensor } from '../brain/sensor'
import { State } from '../brain/state'
import { DataBuffer, AvgDataBuffer } from '../utils/databuffer'
import { Observer, IntervalObserver } from '../utils/observer'

enum EncoderState { HI, LOW }

export class Encoder implements Sensor<number> {
  private state: EncoderState = null
  reading: number = 0

  constructor(
    public id: string,
    private threshold: number = 0.5,
    private buff: DataBuffer<number> = new AvgDataBuffer(10),
    private observer: Observer = new IntervalObserver(20)
  ) { }

  reset(): void {
    this.buff.clear()
    this.state = null
    this.reading = 0
  }

  addRawProvider(provider: () => number) {
    this.observer.subscribe(() => {
      const raw = provider()
      this.addRaw(raw)

      // When buffer is full calulate the ticks      
      if (this.buff.length >= this.buff.maxSize) {
        this.sense(null)
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
    this.buff.add(raw)
  }

  calculate(): number {
    return this.sense(null)
  }

  sense(state: State): number {
    const current = this.buff.read()
     
    // Do not do anything if there is no data in the buffer
    if (this.buff.length != 0) {
      this.buff.clear()

      if (this.state != null) {
        // Only count transition from LOW to HIGH as tick
        if (current >= this.threshold && this.state != EncoderState.HI) {
          this.reading++
        }
      }
      this.state = current >= this.threshold ? EncoderState.HI : EncoderState.LOW
    }

    return this.reading;
  }
}
