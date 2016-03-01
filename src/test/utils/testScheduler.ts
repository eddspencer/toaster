/// <reference path="../../../typings/mocha/mocha.d.ts" />
/// <reference path="../../../typings/chai/chai.d.ts" />
import { expect } from 'chai';
import { IntervalScheduler } from "../../main/utils/scheduler";

describe('Scheduler', () => {
  const scheduler = new IntervalScheduler(5);
  var list: Array<number> = [];

  scheduler.subscribe((time) => {
    list.push(time)
  });

  beforeEach(() => {
    list = [];
  });

  it('should call the subscribers', (done) => {
    scheduler.start();
    setTimeout(() => {
      scheduler.stop();
      
      expect(list).to.not.be.empty;
      expect(list[0]).to.equal(5);
      done();
    }, 20);
  });
});