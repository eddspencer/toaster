import { State } from './state'
import { SensorReading } from './sensor'
import { EventType } from './event'
import geometry from '../geometry/geometry'
import { Behaviour} from '../controllers/controller'

export interface Sentinel {
  analyse(state: State): Array<EventType>
}

export interface SentinelConfig {
  reachedGoalMargin: number,
  atObstacleMargin: number,
  unsafeMargin: number,
  epsilonProgressMade: number
}

interface StateCheckFunction {
  (state: State): EventType
}

module functions {

}

export class DefaultSentinel implements Sentinel {
  private checks: Array<StateCheckFunction>

  constructor(private config: SentinelConfig) {
    this.checks = [this.checkReachedGoal, this.checkForObstacles]
  }

  private checkReachedGoal(state: State): EventType {
    const diff = geometry.distanceBetweenPoints(state.goal, state)

    if (diff <= this.config.reachedGoalMargin) {
      return EventType.AtGoal
    } else {
      return null
    }
  }

  private isBehaviour(behaviour: Behaviour, checkList: Array<Behaviour>): boolean {
    return -1 != checkList.indexOf(behaviour)
  }

  private checkForObstacles(state: State): EventType {
    const isObstacleWithin = (sensorReadings: Array<SensorReading<number>>, distance: number): boolean => {
      for (var i = 0, len = sensorReadings.length; i < len; i++) {
        if (sensorReadings[i].reading < distance) {
          return true
        }
      }
      return false
    }

    if (state.behaviour === Behaviour.Stop) {
      return null
    } else {
      const atObstacle = isObstacleWithin(state.sensorReadings, this.config.atObstacleMargin)
      if (atObstacle) {
        const unsafe = isObstacleWithin(state.sensorReadings, this.config.unsafeMargin)
        if (unsafe) {
          return EventType.Unsafe
        } else {
          return EventType.AtObstacle
        }
      } else if (!this.isBehaviour(state.behaviour, [Behaviour.GoToGoal, Behaviour.FollowWall])) {
        return EventType.ClearedObstacle
      }
    }
  }

  private progressMade(state: State): EventType {
    if (state.progressMade) {
      const distanceToGoal = geometry.distanceBetweenPoints(state.goal, state)
      if (!this.isBehaviour(state.behaviour, [Behaviour.GoToGoal, Behaviour.Stop]) && distanceToGoal + this.config.epsilonProgressMade < state.progressMade) {
        return EventType.ProgressMade
      }
    }
  }

  analyse(state: State): Array<EventType> {
    return this.checks.reduce((events, check) => {
      const event = check(state)
      if (event) {
        events.push(event)
      }
      return events
    }, [])
  }
}