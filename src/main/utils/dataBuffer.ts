interface ReduceFunction<T> {
  (data: Array<T>): T
}

export interface DataBuffer<T> {
  add(value: T): void
  addAll(list: Array<T>): void
  read(): T
  clear(): void
  length: number
  maxSize: number
}

export class SimpleDataBuffer<T> implements DataBuffer<T> {
  private buff: Array<T> = []
  public length: number = 0

  constructor(private reduce: ReduceFunction<T>, public maxSize: number = 1000) { }

  addAll(list: Array<T>) {
    this.buff.push.apply(this.buff, list)
    this.ensureLength()
  }

  add(value: T) {
    this.buff.push(value)
    this.ensureLength()
  }

  private ensureLength(): void {
    if (this.buff.length > this.maxSize) {
      this.buff.shift()
    }
    this.length = this.buff.length
  }

  read(): T {
    return this.reduce(this.buff)
  }

  clear() {
    this.buff = []
  }
}

export class AvgDataBuffer extends SimpleDataBuffer<number> {
  constructor(maxSize: number = 1000) {
    const reduce: ReduceFunction<number> = (buff) => {
      const sum = buff.reduce(function(sum, a) {
        return sum + a
      }, 0)
      const avg = sum / Math.max(buff.length, 1)
      return avg
    }
    super(reduce, maxSize)
  }
}