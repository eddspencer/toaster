/// <reference path="../../../typings/mocha/mocha.d.ts" />
/// <reference path="../../../typings/chai/chai.d.ts" />
import { expect } from 'chai'
import { IntervalObserver } from "../../main/utils/observer"

describe('Scheduler', () => {
  const observer = new IntervalObserver(5)
  var list: Array<number> = []

  observer.subscribe((time) => {
    list.push(time)
  })

  it('should call the subscribers', (done) => {
    observer.start()
    setTimeout(() => {
      observer.stop()
      
      expect(list.length).to.be.greaterThan(1)
      expect(list[0]).to.equal(5)
      done()
    }, 20)
  })
})