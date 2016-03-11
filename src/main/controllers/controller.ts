import { State } from '../brain/state'
import { Velocity } from '../geometry/velocity'

export enum Behaviour {
  Stop, AvoidObstacle, FollowWall, GoToGoal
}

export interface Controller {
  id: string
  behaviour: Behaviour
  execute(state: State): Velocity
  reset(): void
}

export abstract class BaseController implements Controller {
  constructor(public id: string, public behaviour: Behaviour) { }
  abstract execute(state: State)
  reset(): void { }
  toString(): string {
    return this.id
  }
}