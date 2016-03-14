import { Point, Point2d } from '../geometry/point'
import { Behaviour } from '../controllers/controller'
import { SensorReading } from './sensor'

interface Obstacle {

}

interface World {
  obstacles: Array<Obstacle>
}

class BlankWorld implements World {
  obstacles: Array<Obstacle> = []
}

export interface State {
  position: Point
  progressMade: number
  goal: Point
  theta: number
  behaviour: Behaviour
  sensorReadings: Array<SensorReading<number>>
  world: World
}

export class DefaultState implements State {
  world: World = new BlankWorld()
  progressMade: number = 0

  constructor(
    public goal: Point,
    public sensorReadings: Array<SensorReading<number>>,
    public position: Point = new Point2d(0, 0),
    public theta: number = 0,
    public behaviour: Behaviour = Behaviour.Stop
  ) { }
}