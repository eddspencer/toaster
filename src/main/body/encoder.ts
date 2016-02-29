import { DataBuffer } from './databuffer';
import { AvgDataBuffer } from './databuffer';

enum State { HI, LOW }

export class Encoder {
  private state: State = null;
  private counter: number = 0;
  constructor(private threshold: number = 0.5, private buff: DataBuffer<number> = new AvgDataBuffer()) { }

  reset(): void {
    this.buff.clear();
    this.state = null;
    this.counter = 0;
  }
  
  addRaw(raw: number): void {
    this.buff.addRaw(raw);
  }

  ticks(): number {
    const current = this.buff.read();
     
    // Do not do anything if there is no data in the buffer
    if (this.buff.length != 0) {
      this.buff.clear();

      if (this.state != null) {
        // Only count transition from LOW to HIFGH as tick
        if (current >= this.threshold && this.state != State.HI) {
          this.counter++;
        }
      }
      this.state = current >= this.threshold ? State.HI : State.LOW;
    }
    return this.counter;
  }
}