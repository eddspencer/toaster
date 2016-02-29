interface ReduceFunction<T> {
  (data: Array<T>): T;
}

export interface DataBuffer<T> {
  addRaw(raw: T): void;
  addRaws(raw: Array<T>): void;
  read(): T;
  clear(): void;
  length: number;
}

export class SimpleDataBuffer<T> implements DataBuffer<T> {
  private buff: Array<T> = [];

  constructor(private reduce: ReduceFunction<T>, public length: number = 1000) { }

  addRaws(raws: Array<T>) {
    this.buff.push.apply(this.buff, raws);
    this.ensureLength();
  }

  addRaw(raw: T) {
    this.buff.push(raw);
    this.ensureLength();
  }

  private ensureLength(): void {
    if (this.buff.length > this.length) {
      this.buff.shift;
    }
  }

  read(): T {
    return this.reduce(this.buff);
  }

  clear() {
    this.buff = [];
  }
}

export class AvgDataBuffer extends SimpleDataBuffer<number> {
  constructor(length: number = 1000) {
    const reduce: ReduceFunction<number> = (buff) => {
      const sum = buff.reduce(function(sum, a) {
        return sum + a;
      }, 0);
      const avg = sum / Math.max(buff.length, 1);
      return avg;
    };
    super(reduce, length);
  }
}