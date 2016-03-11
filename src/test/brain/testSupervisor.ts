/// <reference path="../../../typings/mocha/mocha.d.ts" />
/// <reference path="../../../typings/chai/chai.d.ts" />
import { expect } from 'chai'

import { Supervisor, DefaultSupervisor, EventConfig } from '../../main/brain/supervisor'
import { EventType } from '../../main/brain/event'
import { State } from '../../main/brain/state'
import { Velocity, Velocity2d } from '../../main/geometry/velocity'
import { BaseController, Behaviour } from '../../main/controllers/controller'
import { StopController } from '../../main/controllers/stop'
import { DefaultVoiceBox, Level } from '../../main/body/voicebox'

class TestController extends BaseController {
  constructor(public id: string, public behaviour: Behaviour) {
    super(id, behaviour)
  }
  execute(state: State): Velocity {
    return new Velocity2d(1, 1)
  }
}

describe('Supervisor', () => {
  const supervisor: Supervisor = new DefaultSupervisor(
    [
      new TestController("GTG", Behaviour.GoToGoal),
      new TestController("AO", Behaviour.AvoidObstacle),
      new StopController()
    ],
    [
      new EventConfig(EventType.AtGoal, Behaviour.Stop),
      new EventConfig(EventType.Unsafe, Behaviour.AvoidObstacle),
      new EventConfig(EventType.AtObstacle, Behaviour.Stop),
      new EventConfig(EventType.ClearedObstacle, Behaviour.GoToGoal),
      new EventConfig(EventType.ProgressMade, Behaviour.GoToGoal),
    ],
    Behaviour.Stop,
    new DefaultVoiceBox(Level.Silence)
  )

  beforeEach(() => {
    supervisor.setBehaviour(Behaviour.Stop)
  })

  it('should set behaviour', () => {
    expect(supervisor.setBehaviour(Behaviour.GoToGoal)).to.be.true
    expect(supervisor.activeController.behaviour).to.equal(Behaviour.GoToGoal)
  })

  it('should error if there are more than one controllers of a type', () => {
    const supervisor: Supervisor = new DefaultSupervisor(
      [new TestController("1", Behaviour.FollowWall), new TestController("2", Behaviour.FollowWall)], [], Behaviour.Stop, new DefaultVoiceBox(Level.Silence)
    )
    expect(supervisor.setBehaviour(Behaviour.FollowWall)).to.be.false
  })

  it('should not change behaviour if there is no change to make', function() {
    expect(supervisor.setBehaviour(Behaviour.Stop)).to.be.false
  })

  function testEvent(expectedBehaviour: Behaviour, events: Array<EventType>) {
    supervisor.processEvents(events)
    expect(supervisor.activeController.behaviour).to.equal(expectedBehaviour)
  }

  it('should priorities at goal event', function() {
    supervisor.setBehaviour(Behaviour.GoToGoal)
    testEvent(Behaviour.Stop, [EventType.AtGoal, EventType.ProgressMade, EventType.Unsafe, EventType.ClearedObstacle])
  })

  it('should priorities unsafe over progress made', function() {
    supervisor.setBehaviour(Behaviour.GoToGoal)
    testEvent(Behaviour.AvoidObstacle, [EventType.Unsafe, EventType.ProgressMade])
  })
})