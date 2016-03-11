import { BaseController, Behaviour } from './controller'
import { Velocity, Velocity2d } from '../geometry/velocity'
import { State } from '../brain/state'

/**
 * Whenever this controller is active always return 0 velocity, so stop
 */
export class StopController extends BaseController  {
  constructor() {
    super("Stop", Behaviour.Stop)
  }
  execute(state: State): Velocity {
    return new Velocity2d(0, 0)
  }
}