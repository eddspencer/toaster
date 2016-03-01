/// <reference path="../../../typings/mocha/mocha.d.ts" />
/// <reference path="../../../typings/chai/chai.d.ts" />
import { expect } from 'chai'
import { Encoder } from "../../main/body/encoder"
import { AvgDataBuffer } from "../../main/utils/databuffer"
import { CountObserver } from "../../main/utils/observer"

describe('Encoder', () => {
  const encoder = new Encoder(0.6, new AvgDataBuffer(5))

  beforeEach(() => {
    encoder.reset()
  })

  it('should not tick on first value', () => {
    encoder.addRaw(1.0)
    expect(encoder.ticks()).to.equal(0)
  })

  it('should process ticks correctly', () => {
    encoder.addRaw(0.1)
    expect(encoder.ticks(), "Initial").to.equal(0)
    encoder.addRaw(0.8)
    expect(encoder.ticks(), "One tick").to.equal(1)
    encoder.addRaw(0.2)
    expect(encoder.ticks(), "One tock").to.equal(1)
    encoder.addRaw(0.5)
    expect(encoder.ticks(), "Too small").to.equal(1)
    encoder.addRaw(0.9)
    expect(encoder.ticks(), "Two ticks").to.equal(2)
  })

  it('should handle if no new raw values are added between reads', () => {
    encoder.addRaw(0)
    expect(encoder.ticks()).to.equal(0)
    encoder.addRaw(0.8)
    expect(encoder.ticks(), "First").to.equal(1)
    expect(encoder.ticks(), "Second").to.equal(1)
  })

  it('should work correctly with observer', () => {
    const encoder = new Encoder(0.6, new AvgDataBuffer(1), new CountObserver(5))
    const values = [0.1, 0.8, 0.2, 0.5, 0.9];    
    
    encoder.addRawProvider(() => {
      return values.shift()
    })
    
    encoder.start()
    expect(encoder.ticks()).to.equal(2)
  })

})
