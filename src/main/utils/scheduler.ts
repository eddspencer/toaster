export interface Scheduler {
  start();
  subscribe(onTick: (time: number) => void);
  stop();
}

export class IntervalScheduler implements Scheduler {
  private id: number;
  private total: number = 0;
  private subscribers: Array<(number) => void> = [];

  constructor(public interval: number) { };

  private callback() {
    this.total += this.interval;
    this.subscribers.forEach((s) => {
      s(this.total)
    });
  }

  subscribe(onTick: (time: number) => void) {
    this.subscribers.push(onTick);
  }

  start() {
    this.id = setInterval(() => this.callback(), this.interval);
  }

  stop() {
    clearInterval(this.id);
  }
}