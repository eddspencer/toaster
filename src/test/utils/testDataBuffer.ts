/// <reference path="../../../typings/mocha/mocha.d.ts" />
/// <reference path="../../../typings/chai/chai.d.ts" />
import { expect } from 'chai'
import { AvgDataBuffer } from "../../main/utils/dataBuffer"

describe('DatBuffer', () => {
  const dataBuffer = new AvgDataBuffer(5)

  beforeEach(() => {
    dataBuffer.clear()
  })

  it('should handle empty case', () => {
    expect(dataBuffer.read()).to.equal(0)
    expect(dataBuffer.length).to.equal(0)
  })

  it('should handle simple case', () => {
    dataBuffer.addRaw(0.5)
    expect(dataBuffer.read()).to.equal(0.5)
    expect(dataBuffer.length).to.equal(1)
  })

  it('should smooth out values', () => {
    dataBuffer.addRaws([0.5, 1, 0.5, 2])
    expect(dataBuffer.read()).to.equal(1)
    expect(dataBuffer.length).to.equal(4)
  })
  
  it('should cycle the buffer', () => {
    dataBuffer.addRaws([0.5, 1, 0.5, 2, 0.5, 1])
    expect(dataBuffer.read()).to.equal(1)
    expect(dataBuffer.length).to.equal(5)
  })

})
