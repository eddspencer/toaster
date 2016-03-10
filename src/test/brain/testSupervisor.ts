/// <reference path="../../../typings/mocha/mocha.d.ts" />
/// <reference path="../../../typings/chai/chai.d.ts" />
import { expect } from 'chai'
import { Supervisor, DefaultSupervisor, EventConfig } from '../../main/brain/supervisor'
import { State } from '../../main/brain/state'
import { Velocity, Velocity2d } from '../../main/geometry/velocity'
import { Controller, Behaviour } from '../../main/controllers/controller'
import { StopController } from '../../main/controllers/stop'

class TestController implements Controller {
  constructor(public behaviour: Behaviour) { }

  execute(state: State): Velocity {
    return new Velocity2d(1, 1)
  }
  reset() {

  }
}

describe('Supervisor', () => {

  const supervisor: Supervisor = new DefaultSupervisor(
    [
      new TestController(Behaviour.GoToGoal),
      new StopController()
    ],
    []
  )

  it('should set behaviour', () => {
    expect(supervisor.setBehaviour(Behaviour.GoToGoal)).to.be.true
    expect(supervisor.activeController.behaviour).to.equal(Behaviour.GoToGoal)
  })

  it('should error if there are more than one controllers of a type', () => {
    const supervisor: Supervisor = new DefaultSupervisor(
      [new TestController(Behaviour.FollowWall), new TestController(Behaviour.FollowWall)], []
    )
    expect(supervisor.setBehaviour(Behaviour.FollowWall)).to.be.false
  })
})