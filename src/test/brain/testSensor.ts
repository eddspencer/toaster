/// <reference path="../../../typings/mocha/mocha.d.ts" />
/// <reference path="../../../typings/chai/chai.d.ts" />
import { expect } from 'chai'
import { IRSensorModel } from '../../main/brain/sensor'
import geometry from '../../main/geometry/geometry'
import { State, DefaultState } from '../../main/brain/state'

describe('Sensor', () => {
  const sensor = new IRSensorModel(
    "Test",
    geometry.createPoint(0, 0),
    0,
    "Group1",
    1,
    0.8
  )

  const state: State = new DefaultState()
  state.world.obstacles.push(geometry.createRectangle(0.05, 0.1, 0.5, 1))

  it('should sense obstacle', () => {
    const distance = sensor.sense(state)
    expect(distance, "Distance to obstacle must be calculated correctly").to.equal(0.05)
    expect(sensor.reading, "Reading property must also be updated").to.equal(distance)
  })
})