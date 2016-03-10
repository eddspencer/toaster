import { State } from '../brain/state'
import { Velocity } from '../geometry/velocity'

export enum Behaviour {
  Stop, AvoidObstacle, FollowWall, GoToGoal
}

export interface Controller {
  behaviour: Behaviour
  execute(state: State): Velocity
  reset(): void
}
